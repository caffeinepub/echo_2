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
  /** Elapsed seconds since loading started — used for progressive messaging */
  addressLoadingElapsed: number;
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
  /** Re-attempts address fetch after a failure (manual retry with backoff). Forces backend regeneration. */
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
// Extended to 90s — ICP Bitcoin API can take 20-30s on mainnet during peak load
const ADDRESS_FETCH_TIMEOUT_MS = 90_000;
// Quick cache-check timeout (5s) used as a fast probe before full attempt
const ADDRESS_CACHE_CHECK_TIMEOUT_MS = 5_000;
// Max auto-retries before surfacing the manual error UI (4 total attempts: 0,1,2,3)
const ADDRESS_MAX_AUTO_RETRIES = 3;
// Backoff delays: attempt 1 = 0s (immediate), attempt 2 = 3s, attempt 3 = 8s
const RETRY_BACKOFF_MS = [0, 3_000, 8_000];
// After all auto-retries fail, auto-schedule one more retry after this delay
const AUTO_FINAL_RETRY_DELAY_MS = 10_000;
// sessionStorage cache TTL: 10 minutes
const SESSION_CACHE_TTL_MS = 10 * 60 * 1_000;

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Strict P2PKH address validation (ICP Bitcoin API returns '1...' addresses on mainnet).
 * Rejects bech32 (bc1...), P2SH (3...), and any other format.
 * base58 charset excludes: 0 (zero), O (capital-O), I (capital-I), l (lowercase-L)
 * Length: 26–34 characters.
 */
function isValidP2PKHAddress(addr: string): boolean {
  if (!addr) return false;
  if (!addr.startsWith("1")) return false;
  if (addr.length < 26 || addr.length > 34) return false;
  // Strict base58 charset — no 0, O, I, l
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(addr)) return false;
  return true;
}

/**
 * Cache bust: evict any address that is obviously invalid.
 * Called on mount to clear stale bc1 addresses from old builds.
 */
function evictInvalidCachedAddress(key: string): void {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { address: string; ts: number };
    const addr = parsed.address ?? "";
    // Evict if: bc1 prefix, invalid base58, wrong length, expired
    const isStale = Date.now() - parsed.ts > SESSION_CACHE_TTL_MS;
    const isInvalid = !isValidP2PKHAddress(addr);
    if (isStale || isInvalid) {
      sessionStorage.removeItem(key);
    }
  } catch {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

function getSessionCacheKey(principalId: string): string {
  return `minty_deposit_addr_${principalId}`;
}

function readSessionCache(principalId: string): string | null {
  try {
    const key = getSessionCacheKey(principalId);
    evictInvalidCachedAddress(key); // bust before reading
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { address: string; ts: number };
    const expired = Date.now() - parsed.ts > SESSION_CACHE_TTL_MS;
    if (expired || !isValidP2PKHAddress(parsed.address)) {
      sessionStorage.removeItem(key);
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
  const [addressLoadingElapsed, setAddressLoadingElapsed] = useState(0);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [walletActivity, setWalletActivity] = useState<WalletActivity[]>([]);

  // Ref to abort in-flight address fetches when a new one starts or context unmounts
  const addressFetchAbortRef = useRef<{ aborted: boolean }>({ aborted: false });
  // Ref to the auto-scheduled final retry timer (so we can cancel it)
  const autoFinalRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Ref for elapsed-time ticker
  const elapsedTickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Ref for loading start time (for elapsed calculation)
  const loadingStartRef = useRef<number>(0);

  const isConnected = !!identity && !identity.getPrincipal().isAnonymous();
  const walletAddress = identity ? identity.getPrincipal().toText() : null;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      addressFetchAbortRef.current.aborted = true;
      if (autoFinalRetryTimerRef.current !== null) {
        clearTimeout(autoFinalRetryTimerRef.current);
        autoFinalRetryTimerRef.current = null;
      }
      if (elapsedTickerRef.current !== null) {
        clearInterval(elapsedTickerRef.current);
        elapsedTickerRef.current = null;
      }
    };
  }, []);

  // Start/stop the elapsed-time ticker when addressLoading changes
  const startElapsedTicker = useCallback(() => {
    if (elapsedTickerRef.current !== null) {
      clearInterval(elapsedTickerRef.current);
    }
    loadingStartRef.current = Date.now();
    setAddressLoadingElapsed(0);
    elapsedTickerRef.current = setInterval(() => {
      setAddressLoadingElapsed(
        Math.floor((Date.now() - loadingStartRef.current) / 1000),
      );
    }, 1000);
  }, []);

  const stopElapsedTicker = useCallback(() => {
    if (elapsedTickerRef.current !== null) {
      clearInterval(elapsedTickerRef.current);
      elapsedTickerRef.current = null;
    }
    setAddressLoadingElapsed(0);
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
   * Force backend to regenerate a fresh address by calling resetUserDepositAddress().
   * Also clears any sessionStorage cache for this user so we don't serve stale data.
   */
  const resetBackendAddress = useCallback(
    async (principalId: string): Promise<void> => {
      if (!actor || isFetching) return;
      // Evict cache so next read goes to backend
      try {
        sessionStorage.removeItem(getSessionCacheKey(principalId));
      } catch {
        /* ignore */
      }
      try {
        await actor.resetUserDepositAddress();
      } catch (err) {
        console.warn("[WalletContext] resetUserDepositAddress failed:", err);
      }
    },
    [actor, isFetching],
  );

  /**
   * Fetch deposit address with auto-retry and exponential backoff.
   * - On mount: evict any stale/invalid cached address first (cache bust)
   * - Session cache check next (fast path for re-opens in same session)
   * - Attempt 0: full 90s timeout
   * - On failure: auto-retry up to ADDRESS_MAX_AUTO_RETRIES times
   *   - Attempt 1: immediate (0s delay), quick 5s probe then full 90s
   *   - Attempt 2: 3s delay, quick 5s probe then full 90s
   *   - Attempt 3: 8s delay, quick 5s probe then full 90s
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
      startElapsedTicker();

      // Cache bust: evict any invalid/stale address before reading
      evictInvalidCachedAddress(getSessionCacheKey(principalId));

      // Fast path: check session cache first
      const cached = readSessionCache(principalId);
      if (cached) {
        setDepositAddress(cached);
        setAddressError(null);
        setAddressLoading(false);
        stopElapsedTicker();
        return;
      }

      // Attempt 0: full timeout
      let address = await attemptAddressFetch(ADDRESS_FETCH_TIMEOUT_MS);
      if (abortSignal.aborted) {
        stopElapsedTicker();
        return;
      }

      if (address && isValidP2PKHAddress(address)) {
        writeSessionCache(principalId, address);
        setDepositAddress(address);
        setAddressError(null);
        setAddressLoading(false);
        stopElapsedTicker();
        return;
      }
      // Got an address but it's invalid (e.g. stale bc1 from backend cache)
      if (address && !isValidP2PKHAddress(address)) {
        console.warn(
          "[WalletContext] Backend returned invalid address:",
          address,
          "— will retry",
        );
        address = null;
      }

      // Auto-retry loop
      for (let attempt = 1; attempt <= ADDRESS_MAX_AUTO_RETRIES; attempt++) {
        if (abortSignal.aborted) {
          stopElapsedTicker();
          return;
        }

        const backoff = RETRY_BACKOFF_MS[attempt - 1] ?? 8_000;
        setAddressRetryAttempt(attempt);

        // Wait with backoff (attempt 1 = 0ms = immediate)
        await delay(backoff);
        if (abortSignal.aborted) {
          stopElapsedTicker();
          return;
        }

        // Quick cache-check probe first (5s)
        address = await attemptAddressFetch(ADDRESS_CACHE_CHECK_TIMEOUT_MS);
        if (abortSignal.aborted) {
          stopElapsedTicker();
          return;
        }

        // Validate the quick probe result
        if (address && !isValidP2PKHAddress(address)) {
          console.warn(
            "[WalletContext] Quick probe returned invalid address:",
            address,
          );
          address = null;
        }

        if (!address) {
          // Cache miss — do full attempt
          address = await attemptAddressFetch(ADDRESS_FETCH_TIMEOUT_MS);
          if (abortSignal.aborted) {
            stopElapsedTicker();
            return;
          }
          if (address && !isValidP2PKHAddress(address)) {
            console.warn(
              "[WalletContext] Full attempt returned invalid address:",
              address,
            );
            address = null;
          }
        }

        if (address) {
          writeSessionCache(principalId, address);
          setDepositAddress(address);
          setAddressError(null);
          setAddressLoading(false);
          stopElapsedTicker();
          return;
        }
      }

      // All auto-retries exhausted — surface error to user
      stopElapsedTicker();
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
          if (finalAddr && !isValidP2PKHAddress(finalAddr)) finalAddr = null;

          if (!finalAddr) {
            finalAddr = await attemptAddressFetch(ADDRESS_FETCH_TIMEOUT_MS);
            if (abortSignal.aborted) return;
            if (finalAddr && !isValidP2PKHAddress(finalAddr)) finalAddr = null;
          }

          if (finalAddr) {
            writeSessionCache(principalId, finalAddr);
            setDepositAddress(finalAddr);
            setAddressError(null);
            setAddressLoading(false);
          }
        }, AUTO_FINAL_RETRY_DELAY_MS);
      }
    },
    [attemptAddressFetch, startElapsedTicker, stopElapsedTicker],
  );

  // Fetch deposit address + deposits + wallet activity
  const refreshDeposits = useCallback(async () => {
    if (!actor || isFetching) return;

    const principalId = identity ? identity.getPrincipal().toText() : "";

    // Abort any in-flight fetch
    addressFetchAbortRef.current.aborted = true;
    const abortSignal = { aborted: false };
    addressFetchAbortRef.current = abortSignal;

    // Start address fetch with auto-retry (fire-and-forget — does not block deposits/activity)
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

  // Manual retry — called from DepositModal after all auto-retries fail.
  // Forces backend to regenerate a fresh address via resetUserDepositAddress(),
  // then retries fetching. This avoids retrying against a cached broken backend state.
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

    setAddressLoading(true);
    setAddressError(null);
    setAddressRetryAttempt(0);
    startElapsedTicker();

    // Step 1: Force backend to regenerate a fresh address (clears broken backend cache)
    await resetBackendAddress(principalId);
    if (abortSignal.aborted) {
      stopElapsedTicker();
      return;
    }

    const manualAttempt = manualRetryCountRef.current;
    manualRetryCountRef.current += 1;
    const backoff = RETRY_BACKOFF_MS[manualAttempt] ?? 0;

    // Brief backoff before retry (attempt 0 = immediate)
    await delay(backoff);
    if (abortSignal.aborted) {
      stopElapsedTicker();
      return;
    }

    // Full fetch attempt with 90s timeout
    let address = await attemptAddressFetch(ADDRESS_FETCH_TIMEOUT_MS);
    if (abortSignal.aborted) {
      stopElapsedTicker();
      return;
    }

    // Validate — reject invalid addresses from backend
    if (address && !isValidP2PKHAddress(address)) {
      console.warn(
        "[WalletContext] Manual retry got invalid address:",
        address,
      );
      address = null;
    }

    if (!address) {
      // One more attempt with full timeout
      address = await attemptAddressFetch(ADDRESS_FETCH_TIMEOUT_MS);
      if (abortSignal.aborted) {
        stopElapsedTicker();
        return;
      }
      if (address && !isValidP2PKHAddress(address)) {
        console.warn(
          "[WalletContext] Manual retry second attempt invalid:",
          address,
        );
        address = null;
      }
    }

    stopElapsedTicker();

    if (address) {
      writeSessionCache(principalId, address);
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
  }, [
    actor,
    isFetching,
    identity,
    attemptAddressFetch,
    resetBackendAddress,
    startElapsedTicker,
    stopElapsedTicker,
  ]);

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
      // ready by the time the user opens the Deposit modal. NOT awaited.
      void (async () => {
        try {
          await actor.warmupDepositAddress();
        } catch {
          // intentionally swallowed — warmup is best-effort
        }
      })();
    }
    if (!identity) {
      // Abort any in-flight fetch + cancel pending auto-retry timer
      addressFetchAbortRef.current.aborted = true;
      if (autoFinalRetryTimerRef.current !== null) {
        clearTimeout(autoFinalRetryTimerRef.current);
        autoFinalRetryTimerRef.current = null;
      }
      stopElapsedTicker();
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
  }, [
    identity,
    actor,
    isFetching,
    refreshBalance,
    refreshDeposits,
    stopElapsedTicker,
  ]);

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
        addressLoadingElapsed,
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
