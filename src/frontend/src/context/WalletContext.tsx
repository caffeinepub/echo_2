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

interface OwnedEntry {
  albumId: string;
  editionNumber: number;
}

interface WalletContextValue {
  isConnected: boolean;
  walletAddress: string | null;
  ownedAlbumIds: string[];
  ownedEditions: Record<string, number>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  mintAlbum: (albumId: string) => Promise<{ editionNumber: number }>;
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
  const [ownedEntries, setOwnedEntries] = useState<OwnedEntry[]>([]);
  const [additionalMints, setAdditionalMints] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const wasConnected = localStorage.getItem(LS_CONNECTED) === "true";
    if (wasConnected && window.solana?.isConnected) {
      window.solana
        .connect({ onlyIfTrusted: true })
        .then(({ publicKey }) => {
          const address = publicKey.toString();
          const entries = loadOwned(address);
          setIsConnected(true);
          setWalletAddress(address);
          setOwnedEntries(entries);
        })
        .catch(() => {
          // Silent reconnect failed — clear stale flag
          localStorage.removeItem(LS_CONNECTED);
        });
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.solana) {
      alert(
        "Phantom wallet not found. Please install the Phantom browser extension.",
      );
      return;
    }
    try {
      const { publicKey } = await window.solana.connect();
      const address = publicKey.toString();
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
    setOwnedEntries([]);
  }, []);

  const mintAlbum = useCallback(
    async (albumId: string): Promise<{ editionNumber: number }> => {
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

      return { editionNumber };
    },
    [walletAddress, additionalMints],
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
        ownedAlbumIds,
        ownedEditions,
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
