import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createActor } from "../backend";

// ─── Types ────────────────────────────────────────────────────────────────────

// getMyBalance and getPaymentAddress are not yet in generated bindings.
// These typed stubs allow optimistic display while the backend methods are deployed.
type ActorWithBalance = {
  getMyBalance?: () => Promise<bigint>;
  getPaymentAddress?: () => Promise<string>;
};

type BalanceStatus = "idle" | "loading" | "ok" | "error";

interface WalletContextValue {
  isConnected: boolean;
  /** BTC balance derived from ckBTC e8s (balance_e8s / 100_000_000). Null when not loaded. */
  btcBalance: number | null;
  balanceStatus: BalanceStatus;
  /** The user's principal string — used internally for payment routing, not shown in UI */
  paymentAddress: string | null;
  refreshBalance: () => Promise<void>;
  // Legacy fields kept for backward-compat with existing consumers
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
  const [balanceStatus, setBalanceStatus] = useState<BalanceStatus>("idle"); // eslint-disable-line
  const [paymentAddress, setPaymentAddress] = useState<string | null>(null);

  // Derive isConnected and walletAddress from Internet Identity
  const isConnected = !!identity;
  const walletAddress = identity ? identity.getPrincipal().toText() : null;

  // Fetch balance + payment address when actor is ready
  const refreshBalance = useCallback(async () => {
    if (!actor || isFetching) return;

    setBalanceStatus("loading");
    try {
      // getMyBalance stub: if method exists on actor, call it; otherwise use optimistic 0
      const actorWithBalance = actor as unknown as ActorWithBalance;

      let e8s = 0n;
      if (typeof actorWithBalance.getMyBalance === "function") {
        e8s = await actorWithBalance.getMyBalance();
      }
      setBtcBalance(Number(e8s) / E8S_PER_BTC);
      setBalanceStatus("ok");

      // Fetch payment address (principal string)
      if (typeof actorWithBalance.getPaymentAddress === "function") {
        const addr = await actorWithBalance.getPaymentAddress();
        setPaymentAddress(addr);
      } else if (identity) {
        // Fallback: use the principal from identity
        setPaymentAddress(identity.getPrincipal().toText());
      }
    } catch (err) {
      console.error("[WalletContext] refreshBalance failed:", err);
      setBalanceStatus("error");
      // Optimistic fallback: show 0 balance, derive address from principal
      setBtcBalance(0);
      if (identity) {
        setPaymentAddress(identity.getPrincipal().toText());
      }
    }
  }, [actor, isFetching, identity]);

  // Refresh on login
  useEffect(() => {
    if (identity && actor && !isFetching) {
      refreshBalance();
    }
    if (!identity) {
      setBtcBalance(null);
      setBalanceStatus("idle");
      setPaymentAddress(null);
    }
  }, [identity, actor, isFetching, refreshBalance]);

  // ─── Legacy stubs kept for backward-compat ──────────────────────────────────

  const connect = useCallback(async () => {
    // Authentication is handled by Internet Identity — this is a no-op stub
  }, []);

  const disconnect = useCallback(async () => {
    // Logout handled by Internet Identity clear() — this is a no-op stub
  }, []);

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

  const getCirculatingSupply = useCallback((_albumId: string): number => {
    return 0;
  }, []);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        btcBalance,
        balanceStatus,
        paymentAddress,
        refreshBalance,
        // Legacy compat
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
