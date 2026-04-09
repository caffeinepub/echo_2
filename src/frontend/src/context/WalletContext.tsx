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

export interface WalletContextValue {
  /** Future-compat: default "BTC". Swap in other currencies without breaking consumers. */
  currency: "BTC";
  isConnected: boolean;
  /** BTC balance derived from ckBTC e8s (btcBalanceE8s / 100_000_000). Null when not loaded. */
  btcBalance: number | null;
  balanceStatus: BalanceStatus;
  /** User's unique BTC deposit address from backend. */
  depositAddress: string | null;
  /** True while deposit address is being fetched. */
  addressLoading: boolean;
  /** Non-null when address fetch failed. Contains the real error message from backend. */
  addressError: string | null;
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
  /** Single-attempt load of the deposit address from backend (checks sessionStorage cache first). */
  loadDepositAddress: () => Promise<void>;
  /** Re-attempts address fetch after a failure. Clears cache + forces backend regeneration first. */
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

// ─── sessionStorage cache helpers ────────────────────────────────────────────

const SESSION_KEY_PREFIX = "minty_deposit_addr_";
const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCachedAddress(principalStr: string): string | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_PREFIX + principalStr);
    if (!raw) return null;
    const parsed: { address: string; expiresAt: number } = JSON.parse(raw);
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY_PREFIX + principalStr);
      return null;
    }
    // Basic format validation — must be non-empty
    if (!parsed.address || parsed.address.trim().length === 0) {
      sessionStorage.removeItem(SESSION_KEY_PREFIX + principalStr);
      return null;
    }
    return parsed.address;
  } catch {
    return null;
  }
}

function setCachedAddress(principalStr: string, address: string): void {
  try {
    sessionStorage.setItem(
      SESSION_KEY_PREFIX + principalStr,
      JSON.stringify({ address, expiresAt: Date.now() + SESSION_TTL_MS }),
    );
  } catch {
    // sessionStorage unavailable — silently ignore
  }
}

function clearCachedAddress(principalStr: string): void {
  try {
    sessionStorage.removeItem(SESSION_KEY_PREFIX + principalStr);
  } catch {
    // silently ignore
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor(createActor);
  const { identity } = useInternetIdentity();

  const [btcBalance, setBtcBalance] = useState<number | null>(null);
  const [balanceStatus, setBalanceStatus] = useState<BalanceStatus>("idle");
  const [paymentAddress, setPaymentAddress] = useState<string | null>(null);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [walletActivity, setWalletActivity] = useState<WalletActivity[]>([]);

  const isConnected = !!identity && !identity.getPrincipal().isAnonymous();
  const walletAddress = identity ? identity.getPrincipal().toText() : null;
  const isAnonymous = identity ? identity.getPrincipal().isAnonymous() : true;

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

  // Single-attempt deposit address load — checks sessionStorage cache first
  const loadDepositAddress = useCallback(async () => {
    if (!actor || isFetching || !identity || isAnonymous) return;

    const principalStr = identity.getPrincipal().toText();
    console.log("[Wallet] Authenticated principal:", principalStr);

    // Check sessionStorage cache first
    const cached = getCachedAddress(principalStr);
    if (cached) {
      console.log("[Wallet] Returned ckBTC address (from cache):", cached);
      setDepositAddress(cached);
      setAddressLoading(false);
      setAddressError(null);
      return;
    }

    setAddressLoading(true);
    setAddressError(null);

    try {
      const result = await actor.getUserDepositAddress();
      console.log("[Wallet] Backend canister call result:", result);

      if (result.__kind__ === "ok") {
        const address = result.ok;
        console.log("[Wallet] Returned ckBTC address:", address);
        setCachedAddress(principalStr, address);
        setDepositAddress(address);
        setAddressError(null);
      } else {
        const errMsg = result.err ?? "Unknown error from backend";
        console.error("[Wallet] Error loading deposit address:", errMsg);
        setDepositAddress(null);
        setAddressError(errMsg);
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error("[Wallet] Error loading deposit address:", errMsg);
      setDepositAddress(null);
      setAddressError(errMsg);
    } finally {
      setAddressLoading(false);
    }
  }, [actor, isFetching, identity, isAnonymous]);

  // Manual retry — clears sessionStorage, resets backend address, then single attempt
  const retryAddressFetch = useCallback(async () => {
    if (!actor || isFetching || !identity || isAnonymous) return;

    const principalStr = identity.getPrincipal().toText();
    clearCachedAddress(principalStr);

    setDepositAddress(null);
    setAddressError(null);

    try {
      await actor.resetUserDepositAddress();
      console.log(
        "[Wallet] resetUserDepositAddress called — backend cache cleared",
      );
    } catch (err) {
      console.warn("[Wallet] resetUserDepositAddress failed:", err);
    }

    await loadDepositAddress();
  }, [actor, isFetching, identity, isAnonymous, loadDepositAddress]);

  // Fetch deposits + activity (separate from address loading)
  const refreshDeposits = useCallback(async () => {
    if (!actor || isFetching) return;
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
  }, [actor, isFetching]);

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
  const isIdentityRef = useRef<boolean>(false);
  useEffect(() => {
    if (identity && actor && !isFetching) {
      isIdentityRef.current = true;
      refreshBalance();
      refreshDeposits();

      // Fire-and-forget warmup: pre-warm the backend address cache
      void (async () => {
        try {
          await actor.warmupDepositAddress();
        } catch {
          // intentionally swallowed — warmup is best-effort
        }
      })();
    }
    if (!identity) {
      isIdentityRef.current = false;
      setBtcBalance(null);
      setBalanceStatus("idle");
      setPaymentAddress(null);
      setDepositAddress(null);
      setAddressLoading(false);
      setAddressError(null);
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
        deposits,
        walletActivity,
        paymentAddress,
        refreshBalance,
        refreshDeposits,
        refreshWalletActivity,
        loadDepositAddress,
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
