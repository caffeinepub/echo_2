import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createActor } from "../backend";
import type { Deposit, WalletActivity } from "../backend.d";

// ─── Types ────────────────────────────────────────────────────────────────────

type BalanceStatus = "idle" | "loading" | "ok" | "error";

export type { Deposit, WalletActivity };

interface WalletContextValue {
  /** Future-compat: default "BTC". Swap in other currencies without breaking consumers. */
  currency: "BTC";
  isConnected: boolean;
  /** BTC balance derived from ckBTC e8s (btcBalanceE8s / 100_000_000). Null when not loaded. */
  btcBalance: number | null;
  balanceStatus: BalanceStatus;
  /** User's unique BTC deposit address (P2PKH '1...' format) from backend. */
  depositAddress: string | null;
  /** True while deposit address is being fetched. */
  addressLoading: boolean;
  /** Non-null when address fetch failed or timed out. */
  addressError: string | null;
  /** Current auto-retry attempt number (0 = first attempt, 1 = retry 1, etc.) */
  addressRetryAttempt: number;
  /** Max auto-retries before showing manual error UI */
  addressMaxRetries: number;
  /** All deposits (pending + confirmed) for this user. */
  deposits: Deposit[];
  /** All wallet activity (deposits, mint costs, auction payouts, withdrawals). */
  walletActivity: WalletActivity[];
  /** The user's principal string (payment address). */
  paymentAddress: string | null;
  refreshBalance: () => Promise<void>;
  refreshDeposits: () => Promise<void>;
  /** Refreshes wallet activity list from backend. */
  refreshWalletActivity: () => Promise<void>;
  /** Re-attempts address fetch after a failure (manual retry with backoff). */
  retryAddressFetch: () => Promise<void>;
  /** Polls backend for new deposits and refreshes balance after. */
  checkDeposits: () => Promise<void>;
  // Legacy compat
  walletAddress: string | null;
  solBalance: number | null;
  ownedAlbumIds: string[];
  ownedEditions: Record<string, number>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  mintAlbum: (
    albumId: string,
    opts?: { onApproved?: () => void },
  ) => Promise<{ editionNumber: number }>;
  getCirculatingSupply: (albumId: string) => number;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const E8S_PER_BTC = 100_000_000;
// Increased to 65s — ICP Bitcoin API can take 20-30s on mainnet, extra buffer for cold starts
const ADDRESS_FETCH_TIMEOUT_MS = 65_000;
// Quick cache-check timeout (5s) used on retry before full 65s attempt
const ADDRESS_CACHE_CHECK_TIMEOUT_MS = 5_000;
// Max auto-retries before surfacing the manual error UI
const ADDRESS_MAX_AUTO_RETRIES = 2;
// Backoff delays: retry 1 = 2s, retry 2 = 4s, retry 3 = 8s
const RETRY_BACKOFF_MS = [2_000, 4_000, 8_000];
// After all auto-retries fail, auto-schedule one more retry after this delay
const AUTO_FINAL_RETRY_DELAY_MS = 10_000;
// sessionStorage cache TTL: 10 minutes
const SESSION_CACHE_TTL_MS = 10 * 60 * 1_000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * P2PKH address validation (ICP Bitcoin API returns '1...' addresses on mainnet).
 * Rejects bech32 (bc1...) and any other format.
 * base58 charset excludes: 0 (zero), O (capital-O), I (capital-I), l (lowercase-L)
 */
function isValidP2PKHAddress(addr: string): boolean {
  return (
    addr.startsWith("1") &&
    addr.length >= 26 &&
    addr.length <= 34 &&
    /^[1-9A-HJ-NP-Za-km-z]+$/.test(addr)
  );
}

function getSessionCacheKey(principalId: string): string {
  return `minty_deposit_addr_${principalId}`;
}

function readSessionCache(principalId: string): string | null {
  try {
    const raw = sessionStorage.getItem(getSessionCacheKey(principalId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { address: string; ts: number };
    const expired = Date.now() - parsed.ts > SESSION_CACHE_TTL_MS;
    if (expired || !isValidP2PKHAddress(parsed.address)) {
      sessionStorage.removeItem(getSessionCacheKey(principalId));
      return null;
    }
    return parsed.address;
  } catch {
    return null;
  }
}

function writeSessionCache(principalId: string, address: string): void {
  try {
    sessionStorage.setItem(
      getSessionCacheKey(principalId),
      JSON.stringify({ address, ts: Date.now() }),
    );
  } catch {
    // sessionStorage may be unavailable (private mode quota limits) — ignore
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor(createActor);
  const { identity } = useInternetIdentity();

  const [btcBalance, setBtcBalance] = useState<number | null>(null);
  const [balanceStatus, setBalanceStatus] = useState<BalanceStatus>("idle");
  const [paymentAddress, setPaymentAddress] = useState<string | null>(null);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressRetryAttempt, setAddressRetryAttempt] = useState(0);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [walletActivity, setWalletActivity] = useState<WalletActivity[]>([]);

  // Ref to abort in-flight address fetches when a new one starts or context unmounts
  const addressFetchAbortRef = useRef<{ aborted: boolean }>({ aborted: false });
  // Ref to the auto-scheduled final retry timer (so we can cancel it)
  const autoFinalRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const isConnected = !!identity && !identity.getPrincipal().isAnonymous();
  const walletAddress = identity ? identity.getPrincipal().toText() : null;

  // Cleanup on unmount: abort any in-flight fetch + cancel any pending auto-retry timer
  useEffect(() => {
    return () => {
      addressFetchAbortRef.current.aborted = true;
      if (autoFinalRetryTimerRef.current !== null) {
        clearTimeout(autoFinalRetryTimerRef.current);
        autoFinalRetryTimerRef.current = null;
      }
    };
  }, []);

  // Fetch balance from backend
  const refreshBalance = useCallback(async () => {
    if (!actor || isFetching) return;
    setBalanceStatus("loading");
    try {
      const e8s = await actor.getMyBalance();
      setBtcBalance(Number(e8s) / E8S_PER_BTC);
      setBalanceStatus("ok");

      const addrResult = await actor.getPaymentAddress();
      if (addrResult.__kind__ === "ok") {
        setPaymentAddress(addrResult.ok);
      } else {
        console.error(
          "[WalletContext] getPaymentAddress error:",
          addrResult.err,
        );
        setPaymentAddress(null);
      }
    } catch (err) {
      console.error("[WalletContext] refreshBalance failed:", err);
      setBalanceStatus("error");
      setBtcBalance(0);
      if (identity) setPaymentAddress(identity.getPrincipal().toText());
    }
  }, [actor, isFetching, identity]);

  /**
   * Attempt to fetch the deposit address with a given timeout.
   * Returns the address string on success, null on failure/timeout.
   */
  const attemptAddressFetch = useCallback(
    async (timeoutMs: number): Promise<string | null> => {
      if (!actor || isFetching) return null;
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), timeoutMs),
        );
        const addrResult = await Promise.race([
          actor.getUserDepositAddress(),
          timeoutPromise,
        ]);
        if (addrResult.__kind__ === "ok") {
          return addrResult.ok;
        }
        console.error(
          "[WalletContext] getUserDepositAddress error:",
          addrResult.err,
        );
        return null;
      } catch (err) {
        console.error("[WalletContext] getUserDepositAddress failed:", err);
        return null;
      }
    },
    [actor, isFetching],
  );

  /**
   * Fetch deposit address with auto-retry and exponential backoff.
   * - Session cache check first (fast path for re-opens in same session)
   * - Attempt 0: full 65s timeout
   * - On failure: auto-retry up to ADDRESS_MAX_AUTO_RETRIES times with backoff
   * - Each retry first does a quick 5s cache check, then falls back to full 65s
   * - Only surfaces error UI after all auto-retries are exhausted
   * - After surfacing error, schedules one final auto-retry after 10s
   */
  const fetchAddressWithRetry = useCallback(
    async (abortSignal: { aborted: boolean }, principalId: string) => {
      // Cancel any pending auto-final-retry timer
      if (autoFinalRetryTimerRef.current !== null) {
        clearTimeout(autoFinalRetryTimerRef.current);
        autoFinalRetryTimerRef.current = null;
      }

      setAddressLoading(true);
      setAddressError(null);
      setAddressRetryAttempt(0);

      // Fast path: check session cache first
      const cached = readSessionCache(principalId);
      if (cached) {
        setDepositAddress(cached);
        setAddressError(null);
        setAddressLoading(false);
        return;
      }

      // Attempt 0: full timeout
      let address = await attemptAddressFetch(ADDRESS_FETCH_TIMEOUT_MS);
      if (abortSignal.aborted) return;

      if (address) {
        if (isValidP2PKHAddress(address)) {
          writeSessionCache(principalId, address);
        }
        setDepositAddress(address);
        setAddressError(null);
        setAddressLoading(false);
        return;
      }

      // Auto-retry loop
      for (let attempt = 1; attempt <= ADDRESS_MAX_AUTO_RETRIES; attempt++) {
        if (abortSignal.aborted) return;

        const backoff = RETRY_BACKOFF_MS[attempt - 1] ?? 8_000;
        setAddressRetryAttempt(attempt);

        // Wait with backoff
        await delay(backoff);
        if (abortSignal.aborted) return;

        // First try a quick cache check (5s)
        address = await attemptAddressFetch(ADDRESS_CACHE_CHECK_TIMEOUT_MS);
        if (abortSignal.aborted) return;

        if (!address) {
          // Cache miss — do full attempt
          address = await attemptAddressFetch(ADDRESS_FETCH_TIMEOUT_MS);
          if (abortSignal.aborted) return;
        }

        if (address) {
          if (isValidP2PKHAddress(address)) {
            writeSessionCache(principalId, address);
          }
          setDepositAddress(address);
          setAddressError(null);
          setAddressLoading(false);
          return;
        }
      }

      // All auto-retries exhausted — surface error to user
      setDepositAddress(null);
      setAddressError(
        "Could not load your deposit address. Tap retry to try again.",
      );
      setAddressLoading(false);

      // Schedule one final silent auto-retry after 10s (user doesn't have to tap)
      if (!abortSignal.aborted) {
        autoFinalRetryTimerRef.current = setTimeout(async () => {
          autoFinalRetryTimerRef.current = null;
          if (abortSignal.aborted) return;

          // Quick probe first
          let finalAddr = await attemptAddressFetch(
            ADDRESS_CACHE_CHECK_TIMEOUT_MS,
          );
          if (abortSignal.aborted) return;

          if (!finalAddr) {
            finalAddr = await attemptAddressFetch(ADDRESS_FETCH_TIMEOUT_MS);
            if (abortSignal.aborted) return;
          }

          if (finalAddr) {
            if (isValidP2PKHAddress(finalAddr)) {
              writeSessionCache(principalId, finalAddr);
            }
            setDepositAddress(finalAddr);
            setAddressError(null);
            setAddressLoading(false);
          }
        }, AUTO_FINAL_RETRY_DELAY_MS);
      }
    },
    [attemptAddressFetch],
  );

  // Fetch deposit address + deposits + wallet activity
  const refreshDeposits = useCallback(async () => {
    if (!actor || isFetching) return;

    const principalId = identity ? identity.getPrincipal().toText() : "";

    // Abort any in-flight fetch
    addressFetchAbortRef.current.aborted = true;
    const abortSignal = { aborted: false };
    addressFetchAbortRef.current = abortSignal;

    // Start address fetch with auto-retry
    fetchAddressWithRetry(abortSignal, principalId);

    // Deposits + activity can fail independently without blocking address display
    try {
      const [deps, activity] = await Promise.all([
        actor.getUserDeposits(),
        actor.getAllWalletActivity(),
      ]);
      setDeposits(deps);
      setWalletActivity(activity);
    } catch (err) {
      console.error("[WalletContext] refreshDeposits (activity) failed:", err);
    }
  }, [actor, isFetching, identity, fetchAddressWithRetry]);

  // Manual retry — called from DepositModal after all auto-retries fail
  // Uses exponential backoff based on how many manual retries have been attempted
  const manualRetryCountRef = useRef(0);
  const retryAddressFetch = useCallback(async () => {
    if (!actor || isFetching) return;

    const principalId = identity ? identity.getPrincipal().toText() : "";

    // Cancel any pending auto-final-retry timer before starting manual retry
    if (autoFinalRetryTimerRef.current !== null) {
      clearTimeout(autoFinalRetryTimerRef.current);
      autoFinalRetryTimerRef.current = null;
    }

    // Abort any in-flight fetch
    addressFetchAbortRef.current.aborted = true;
    const abortSignal = { aborted: false };
    addressFetchAbortRef.current = abortSignal;

    const manualAttempt = manualRetryCountRef.current;
    manualRetryCountRef.current += 1;

    const backoff = RETRY_BACKOFF_MS[manualAttempt] ?? 8_000;

    setAddressLoading(true);
    setAddressError(null);
    setAddressRetryAttempt(0);

    // Brief backoff before retry
    await delay(backoff);
    if (abortSignal.aborted) return;

    // Quick cache check first
    let address = await attemptAddressFetch(ADDRESS_CACHE_CHECK_TIMEOUT_MS);
    if (abortSignal.aborted) return;

    if (!address) {
      // Full attempt
      address = await attemptAddressFetch(ADDRESS_FETCH_TIMEOUT_MS);
      if (abortSignal.aborted) return;
    }

    if (address) {
      if (isValidP2PKHAddress(address)) {
        writeSessionCache(principalId, address);
      }
      setDepositAddress(address);
      setAddressError(null);
      setAddressLoading(false);
    } else {
      setDepositAddress(null);
      setAddressError(
        "Could not load your deposit address. Tap retry to try again.",
      );
      setAddressLoading(false);
    }
  }, [actor, isFetching, identity, attemptAddressFetch]);

  // Poll backend for new deposits, then refresh balance
  const checkDeposits = useCallback(async () => {
    if (!actor || isFetching) return;
    try {
      await actor.checkForNewDeposits();
      await actor.confirmPendingDeposits();
      await Promise.all([refreshBalance(), refreshDeposits()]);
    } catch (err) {
      console.error("[WalletContext] checkDeposits failed:", err);
    }
  }, [actor, isFetching, refreshBalance, refreshDeposits]);

  // Refresh wallet activity from backend
  const refreshWalletActivity = useCallback(async () => {
    if (!actor || isFetching) return;
    try {
      const activity = await actor.getAllWalletActivity();
      setWalletActivity(activity);
    } catch (err) {
      console.error("[WalletContext] refreshWalletActivity failed:", err);
    }
  }, [actor, isFetching]);

  // Hydrate wallet on login
  useEffect(() => {
    if (identity && actor && !isFetching) {
      manualRetryCountRef.current = 0;
      refreshBalance();
      refreshDeposits();

      // Fire-and-forget warmup: pre-warm the backend address cache so it's
      // ready by the time the user opens the Deposit modal. No await, no error handling.
      try {
        // warmupDepositAddress may not exist in all backend versions — guard defensively
        const actorAny = actor as unknown as Record<
          string,
          (() => Promise<unknown>) | undefined
        >;
        if (typeof actorAny.warmupDepositAddress === "function") {
          actorAny.warmupDepositAddress();
        }
      } catch {
        // intentionally swallowed
      }
    }
    if (!identity) {
      // Abort any in-flight fetch + cancel pending auto-retry timer
      addressFetchAbortRef.current.aborted = true;
      if (autoFinalRetryTimerRef.current !== null) {
        clearTimeout(autoFinalRetryTimerRef.current);
        autoFinalRetryTimerRef.current = null;
      }
      manualRetryCountRef.current = 0;
      setBtcBalance(null);
      setBalanceStatus("idle");
      setPaymentAddress(null);
      setDepositAddress(null);
      setAddressLoading(false);
      setAddressError(null);
      setAddressRetryAttempt(0);
      setDeposits([]);
      setWalletActivity([]);
    }
  }, [identity, actor, isFetching, refreshBalance, refreshDeposits]);

  // ─── Legacy stubs ────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {}, []);
  const disconnect = useCallback(async () => {}, []);

  const mintAlbum = useCallback(
    async (
      _albumId: string,
      opts?: { onApproved?: () => void },
    ): Promise<{ editionNumber: number }> => {
      opts?.onApproved?.();
      return { editionNumber: 1 };
    },
    [],
  );

  const getCirculatingSupply = useCallback((_albumId: string): number => 0, []);

  return (
    <WalletContext.Provider
      value={{
        currency: "BTC",
        isConnected,
        btcBalance,
        balanceStatus,
        depositAddress,
        addressLoading,
        addressError,
        addressRetryAttempt,
        addressMaxRetries: ADDRESS_MAX_AUTO_RETRIES,
        deposits,
        walletActivity,
        paymentAddress,
        refreshBalance,
        refreshDeposits,
        refreshWalletActivity,
        retryAddressFetch,
        checkDeposits,
        walletAddress,
        solBalance: btcBalance,
        ownedAlbumIds: [],
        ownedEditions: {},
        connect,
        disconnect,
        mintAlbum,
        getCirculatingSupply,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx)
    throw new Error("useWalletContext must be used within WalletProvider");
  return ctx;
}

// ─── Polling hook — use inside wallet modal ───────────────────────────────────
/** Polls checkDeposits every 30s while `active` is true. */
export function useDepositPolling(active: boolean) {
  const { checkDeposits } = useWalletContext();
  const checkRef = useRef(checkDeposits);
  checkRef.current = checkDeposits;

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => checkRef.current(), 30_000);
    return () => clearInterval(id);
  }, [active]);
}
