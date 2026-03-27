import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ALBUMS } from "../data/albums";

const WALLET_ADDRESS = "7KxM3nRabPqFdwW1P9m";
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
  connect: () => void;
  disconnect: () => void;
  mintAlbum: (albumId: string) => Promise<{ editionNumber: number }>;
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

  useEffect(() => {
    const wasConnected = localStorage.getItem(LS_CONNECTED) === "true";
    if (wasConnected) {
      const entries = loadOwned(WALLET_ADDRESS);
      setIsConnected(true);
      setWalletAddress(WALLET_ADDRESS);
      setOwnedEntries(entries);
    }
  }, []);

  const connect = useCallback(() => {
    localStorage.setItem(LS_CONNECTED, "true");
    const entries = loadOwned(WALLET_ADDRESS);
    setIsConnected(true);
    setWalletAddress(WALLET_ADDRESS);
    setOwnedEntries(entries);
  }, []);

  const disconnect = useCallback(() => {
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

      const editionNumber = album.editions_in_circulation + 1;

      setOwnedEntries((prev) => {
        const next = [...prev, { albumId, editionNumber }];
        saveOwned(WALLET_ADDRESS, next);
        return next;
      });

      return { editionNumber };
    },
    [],
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
