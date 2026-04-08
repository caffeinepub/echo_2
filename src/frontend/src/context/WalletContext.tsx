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
  /** All deposits (pending + confirmed) for this user. */
  deposits: Deposit[];
  /** All wallet activity (deposits, mint costs, auction payouts). */
  walletActivity: WalletActivity[];
  /** The user's principal string (payment address). */
  paymentAddress: string | null;
  refreshBalance: () => Promise<void>;
  refreshDeposits: () => Promise<void>;
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

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor(createActor);
  const { identity } = useInternetIdentity();

  const [btcBalance, setBtcBalance] = useState<number | null>(null);
  const [balanceStatus, setBalanceStatus] = useState<BalanceStatus>("idle");
  const [paymentAddress, setPaymentAddress] = useState<string | null>(null);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
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

      const addr = await actor.getPaymentAddress();
      setPaymentAddress(addr);
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
    try {
      const [addr, deps, activity] = await Promise.all([
        actor.getUserDepositAddress(),
        actor.getUserDeposits(),
        actor.getAllWalletActivity(),
      ]);
      setDepositAddress(addr);
      setDeposits(deps);
      setWalletActivity(activity);
    } catch (err) {
      console.error("[WalletContext] refreshDeposits failed:", err);
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
        deposits,
        walletActivity,
        paymentAddress,
        refreshBalance,
        refreshDeposits,
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
