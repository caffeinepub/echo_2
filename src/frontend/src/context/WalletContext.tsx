import { createContext, useCallback, useContext, useState } from "react";

const LS_CONNECTED = "minty_wallet_connected";
const LS_OWNED_PREFIX = "minty_owned_";

interface OwnedEntry {
  itemId: string;
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
  const [isConnected, setIsConnected] = useState(
    () => localStorage.getItem(LS_CONNECTED) === "true",
  );
  const [walletAddress, setWalletAddress] = useState<string | null>(
    () => localStorage.getItem(`${LS_CONNECTED}_addr`) ?? null,
  );
  const [balanceStatus] = useState<BalanceStatus>("idle");
  const [solBalance] = useState<number | null>(null);
  const [ownedEntries, setOwnedEntries] = useState<OwnedEntry[]>(() => {
    const addr = localStorage.getItem(`${LS_CONNECTED}_addr`);
    return addr ? loadOwned(addr) : [];
  });
  const [additionalMints, setAdditionalMints] = useState<
    Record<string, number>
  >({});

  const refreshBalance = useCallback(async () => {
    // Balance fetching not needed for Internet Identity–based auth
  }, []);

  const connect = useCallback(async () => {
    // Authentication is handled via Internet Identity in TopBar.
    // This stub allows legacy consumers (MintModal etc.) to compile.
    const mockAddr = "minty-user";
    localStorage.setItem(LS_CONNECTED, "true");
    localStorage.setItem(`${LS_CONNECTED}_addr`, mockAddr);
    const entries = loadOwned(mockAddr);
    setIsConnected(true);
    setWalletAddress(mockAddr);
    setOwnedEntries(entries);
  }, []);

  const disconnect = useCallback(async () => {
    localStorage.removeItem(LS_CONNECTED);
    localStorage.removeItem(`${LS_CONNECTED}_addr`);
    setIsConnected(false);
    setWalletAddress(null);
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

      const currentExtra = additionalMints[albumId] ?? 0;
      const editionNumber = currentExtra + 1;

      const address = walletAddress ?? "anonymous";
      setOwnedEntries((prev) => {
        const next = [...prev, { itemId: albumId, editionNumber }];
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
      return additionalMints[albumId] ?? 0;
    },
    [additionalMints],
  );

  const ownedAlbumIds = ownedEntries.map((e) => e.itemId);
  const ownedEditions: Record<string, number> = {};
  for (const e of ownedEntries) {
    ownedEditions[e.itemId] = e.editionNumber;
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
