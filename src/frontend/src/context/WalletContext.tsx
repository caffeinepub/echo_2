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
  /** User's unique BTC deposit address (bc1q… format) from backend. */
  depositAddress: string | null;
  /** True while deposit address is being fetched. */
  addressLoading: boolean;
  /** Non-null when address fetch failed or timed out. */
  addressError: string | null;
  /** All deposits (pending + confirmed) for this user. */
  deposits: Deposit[];
  /** All wallet activity (deposits, mint costs, auction payouts). */
  walletActivity: WalletActivity[];
  /** The user's principal string (payment address). */
  paymentAddress: string | null;
  refreshBalance: () => Promise<void>;
  refreshDeposits: () => Promise<void>;
  /** Re-attempts address fetch after a failure. */
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
const ADDRESS_FETCH_TIMEOUT_MS = 15_000;

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

  // Fetch deposit address + deposits + wallet activity
  const refreshDeposits = useCallback(async () => {
    if (!actor || isFetching) return;

    // Address fetch with timeout
    setAddressLoading(true);
    setAddressError(null);

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("timeout")),
          ADDRESS_FETCH_TIMEOUT_MS,
        ),
      );

      const addrResult = await Promise.race([
        actor.getUserDepositAddress(),
        timeoutPromise,
      ]);

      if (addrResult.__kind__ === "ok") {
        setDepositAddress(addrResult.ok);
        setAddressError(null);
      } else {
        console.error(
          "[WalletContext] getUserDepositAddress error:",
          addrResult.err,
        );
        setDepositAddress(null);
        setAddressError(
          "Could not load your deposit address. Tap retry to try again.",
        );
      }
    } catch (err) {
      console.error("[WalletContext] getUserDepositAddress failed:", err);
      setDepositAddress(null);
      setAddressError(
        "Could not load your deposit address. Tap retry to try again.",
      );
    } finally {
      setAddressLoading(false);
    }

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
  }, [actor, isFetching]);

  // Retry address fetch (called from DepositModal)
  const retryAddressFetch = useCallback(async () => {
    await refreshDeposits();
  }, [refreshDeposits]);

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

  // Hydrate wallet on login
  useEffect(() => {
    if (identity && actor && !isFetching) {
      refreshBalance();
      refreshDeposits();
    }
    if (!identity) {
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
