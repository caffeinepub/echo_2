import "../types/phantom";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ALBUMS } from "../data/albums";

const LS_CONNECTED = "echo_wallet_connected";
const LS_OWNED_PREFIX = "echo_owned_";

const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
const LAMPORTS_PER_SOL = 1_000_000_000;

async function fetchSOLBalance(address: string): Promise<number> {
  const res = await fetch(SOLANA_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [address, { commitment: "confirmed" }],
    }),
  });
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message ?? "RPC error");
  const lamports: number = json.result.value;
  return lamports / LAMPORTS_PER_SOL;
}

interface OwnedEntry {
  albumId: string;
  editionNumber: number;
}

type BalanceStatus = "idle" | "loading" | "ok" | "error";

interface WalletContextValue {
  isConnected: boolean;
  walletAddress: string | null;
  solBalance: number | null;
  balanceStatus: BalanceStatus;
  ownedAlbumIds: string[];
  ownedEditions: Record<string, number>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  mintAlbum: (
    albumId: string,
    opts?: { onApproved?: () => void },
  ) => Promise<{ editionNumber: number }>;
  getCirculatingSupply: (albumId: string) => number;
}

const WalletContext = createContext<WalletContextValue | null>(null);

function loadOwned(address: string): OwnedEntry[] {
  try {
    const raw = localStorage.getItem(`${LS_OWNED_PREFIX}${address}`);
    return raw ? (JSON.parse(raw) as OwnedEntry[]) : [];
  } catch {
    return [];
  }
}

function saveOwned(address: string, entries: OwnedEntry[]) {
  localStorage.setItem(`${LS_OWNED_PREFIX}${address}`, JSON.stringify(entries));
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balanceStatus, setBalanceStatus] = useState<BalanceStatus>("idle");
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [ownedEntries, setOwnedEntries] = useState<OwnedEntry[]>([]);
  const [additionalMints, setAdditionalMints] = useState<
    Record<string, number>
  >({});

  const fetchBalance = useCallback(async (address: string) => {
    setBalanceStatus("loading");
    setSolBalance(null);
    try {
      let balance: number;
      try {
        balance = await fetchSOLBalance(address);
      } catch (firstErr) {
        console.warn(
          "SOL balance fetch failed, retrying in 1500ms...",
          firstErr,
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));
        balance = await fetchSOLBalance(address);
      }
      setSolBalance(balance);
      setBalanceStatus("ok");
    } catch (err) {
      console.error("Failed to fetch SOL balance after retry:", err);
      setSolBalance(null);
      setBalanceStatus("error");
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!walletAddress) return;
    await fetchBalance(walletAddress);
  }, [walletAddress, fetchBalance]);

  // Fetch balance whenever wallet address changes
  useEffect(() => {
    if (walletAddress) {
      fetchBalance(walletAddress);
    } else {
      setBalanceStatus("idle");
      setSolBalance(null);
    }
  }, [walletAddress, fetchBalance]);

  // Auto-reconnect on page load if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem(LS_CONNECTED) === "true";
    if (wasConnected && window.solana?.isConnected) {
      window.solana
        .connect({ onlyIfTrusted: true })
        .then(({ publicKey: pk }) => {
          const address = pk.toString();
          const entries = loadOwned(address);
          setIsConnected(true);
          setWalletAddress(address);
          setOwnedEntries(entries);
        })
        .catch(() => {
          localStorage.removeItem(LS_CONNECTED);
        });
    }
  }, []);

  // Listen for wallet account changes
  useEffect(() => {
    const phantom = window.solana;
    if (!phantom) return;

    const handleAccountChange = (pk: { toString(): string } | null) => {
      if (pk) {
        const address = pk.toString();
        const entries = loadOwned(address);
        setWalletAddress(address);
        setOwnedEntries(entries);
      } else {
        localStorage.removeItem(LS_CONNECTED);
        setIsConnected(false);
        setWalletAddress(null);
        setOwnedEntries([]);
        setBalanceStatus("idle");
        setSolBalance(null);
      }
    };

    phantom.on("accountChanged", handleAccountChange);
    return () => {
      phantom.off?.("accountChanged", handleAccountChange);
    };
  }, []);

  const connect = useCallback(async () => {
    if (!window.solana) {
      alert(
        "Phantom wallet not found. Please install the Phantom browser extension.",
      );
      return;
    }
    try {
      const { publicKey: pk } = await window.solana.connect();
      const address = pk.toString();
      localStorage.setItem(LS_CONNECTED, "true");
      const entries = loadOwned(address);
      setIsConnected(true);
      setWalletAddress(address);
      setOwnedEntries(entries);
    } catch (err) {
      console.error("Phantom connect error:", err);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await window.solana?.disconnect();
    } catch {
      // ignore
    }
    localStorage.removeItem(LS_CONNECTED);
    setIsConnected(false);
    setWalletAddress(null);
    setBalanceStatus("idle");
    setSolBalance(null);
    setOwnedEntries([]);
  }, []);

  const mintAlbum = useCallback(
    async (
      albumId: string,
      opts?: { onApproved?: () => void },
    ): Promise<{ editionNumber: number }> => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      opts?.onApproved?.();
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const album = ALBUMS.find((a) => a.id === albumId);
      if (!album) throw new Error("Album not found");

      const currentExtra = additionalMints[albumId] ?? 0;
      const editionNumber = album.editions_in_circulation + currentExtra + 1;

      const address = walletAddress ?? "anonymous";
      setOwnedEntries((prev) => {
        const next = [...prev, { albumId, editionNumber }];
        saveOwned(address, next);
        return next;
      });

      setAdditionalMints((prev) => ({
        ...prev,
        [albumId]: (prev[albumId] ?? 0) + 1,
      }));

      // Refresh balance after confirmed purchase
      if (walletAddress) {
        await fetchBalance(walletAddress);
      }

      return { editionNumber };
    },
    [walletAddress, additionalMints, fetchBalance],
  );

  const getCirculatingSupply = useCallback(
    (albumId: string): number => {
      const album = ALBUMS.find((a) => a.id === albumId);
      if (!album) return 0;
      return album.editions_in_circulation + (additionalMints[albumId] ?? 0);
    },
    [additionalMints],
  );

  const ownedAlbumIds = ownedEntries.map((e) => e.albumId);
  const ownedEditions: Record<string, number> = {};
  for (const e of ownedEntries) {
    ownedEditions[e.albumId] = e.editionNumber;
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        solBalance,
        balanceStatus,
        ownedAlbumIds,
        ownedEditions,
        connect,
        disconnect,
        refreshBalance,
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
