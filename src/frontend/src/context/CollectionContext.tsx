import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LS_KEY = "minty_collection";
const LS_PACKS_KEY = "minty_sealed_packs";
const LS_BURNED_KEY = "minty_burned_counts";
// Track packs that are currently being opened (atomicity guard)
const OPENING_KEY = "minty_opening_packs";

export interface CollectionNFT {
  id: string;
  title: string;
  setName: string;
  editionNumber: number;
  totalSupply: number;
  mediaType: "photo" | "video";
  imageUrl: string;
  rarity: string;
  mintDate: string;
  creator: string;
  owners: string[];
  views: number;
  isLeader: boolean;
  hasOwnershipHistory: boolean;
  addedAt: number;
  burnedCount?: number;
  /** ISO timestamp of capture, e.g. "2026-04-03T23:42:00Z" */
  capturedAt?: string;
  /** Human-readable location, e.g. "New York, NY" */
  location?: string;
  /** Highest historical purchase price paid (USD) */
  purchasePrice?: number;
  /** Short description or caption */
  caption?: string;
  /** URL for a muted looping 2-second preview clip */
  previewClipUrl?: string;
}

export interface SealedPack {
  id: string;
  setName: string;
  editionNumber: number;
  totalSupply: number; // total packs in the set
  collectibleType: "photo" | "video";
  collectibleNumber: number; // this collectible's number within its type
  typeSupply: number; // total collectibles of this type in the set
  pendingNFT: CollectionNFT;
  createdAt: number;
  // Optional backend fields
  releaseId?: string;
  ownerPrincipal?: string;
  status?: "sealed" | "opened";
  openedAt?: number;
  coverPhotoUrl?: string; // separate cover art for the pack wrapper (not a collectible)
}

interface CollectionCtx {
  nfts: CollectionNFT[];
  sealedPacks: SealedPack[];
  burnedCounts: Record<string, number>;
  addNFT: (nft: CollectionNFT) => void;
  addNFTs: (nfts: CollectionNFT[]) => void;
  addSealedPacks: (packs: SealedPack[]) => void;
  openPack: (packId: string) => Promise<CollectionNFT>;
  removeNFT: (nftId: string) => void;
  removeSealedPacks: (packIds: string[]) => void;
  burnNFT: (nftId: string) => void;
}

const CollectionContext = createContext<CollectionCtx | null>(null);

function loadNFTsFromStorage(): CollectionNFT[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CollectionNFT[];
  } catch {
    return [];
  }
}

function saveNFTsToStorage(nfts: CollectionNFT[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(nfts));
  } catch {
    // ignore
  }
}

function loadPacksFromStorage(): SealedPack[] {
  try {
    const raw = localStorage.getItem(LS_PACKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SealedPack[];
  } catch {
    return [];
  }
}

function savePacksToStorage(packs: SealedPack[]) {
  try {
    localStorage.setItem(LS_PACKS_KEY, JSON.stringify(packs));
  } catch {
    // ignore
  }
}

function loadBurnedCountsFromStorage(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LS_BURNED_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

function saveBurnedCountsToStorage(counts: Record<string, number>) {
  try {
    localStorage.setItem(LS_BURNED_KEY, JSON.stringify(counts));
  } catch {
    // ignore
  }
}

// Atomicity guard: track packs currently being opened
function isPackOpening(packId: string): boolean {
  try {
    const raw = localStorage.getItem(OPENING_KEY);
    const opening: string[] = raw ? JSON.parse(raw) : [];
    return opening.includes(packId);
  } catch {
    return false;
  }
}

function markPackOpening(packId: string) {
  try {
    const raw = localStorage.getItem(OPENING_KEY);
    const opening: string[] = raw ? JSON.parse(raw) : [];
    if (!opening.includes(packId)) {
      opening.push(packId);
      localStorage.setItem(OPENING_KEY, JSON.stringify(opening));
    }
  } catch {
    // ignore
  }
}

function unmarkPackOpening(packId: string) {
  try {
    const raw = localStorage.getItem(OPENING_KEY);
    const opening: string[] = raw ? JSON.parse(raw) : [];
    const filtered = opening.filter((id) => id !== packId);
    localStorage.setItem(OPENING_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

// Migrate: clear old pokemon TCG image URLs from localStorage before component mounts
function migrateLegacyData() {
  try {
    const raw = localStorage.getItem("minty_collection");
    const rawPacks = localStorage.getItem("minty_sealed_packs");
    if (raw?.includes("pokemontcg.io") || rawPacks?.includes("pokemontcg.io")) {
      localStorage.removeItem("minty_collection");
      localStorage.removeItem("minty_collection_seeded");
      localStorage.removeItem("minty_sealed_packs");
      localStorage.removeItem("minty_packs_seeded");
    }
  } catch {
    // ignore
  }
}
migrateLegacyData();

export function CollectionProvider({
  children,
}: { children: React.ReactNode }) {
  const [nfts, setNfts] = useState<CollectionNFT[]>(() =>
    loadNFTsFromStorage(),
  );
  const [sealedPacks, setSealedPacks] = useState<SealedPack[]>(() =>
    loadPacksFromStorage(),
  );
  const [burnedCounts, setBurnedCounts] = useState<Record<string, number>>(() =>
    loadBurnedCountsFromStorage(),
  );

  // Persist whenever nfts change
  useEffect(() => {
    saveNFTsToStorage(nfts);
  }, [nfts]);

  // Persist whenever sealedPacks change
  useEffect(() => {
    savePacksToStorage(sealedPacks);
  }, [sealedPacks]);

  // Persist whenever burnedCounts change
  useEffect(() => {
    saveBurnedCountsToStorage(burnedCounts);
  }, [burnedCounts]);

  const addNFT = useCallback((nft: CollectionNFT) => {
    setNfts((prev) => [nft, ...prev]);
  }, []);

  const addNFTs = useCallback((newNfts: CollectionNFT[]) => {
    setNfts((prev) => [...newNfts, ...prev]);
  }, []);

  const addSealedPacks = useCallback((packs: SealedPack[]) => {
    setSealedPacks((prev) => [...packs, ...prev]);
  }, []);

  const openPack = useCallback(
    async (packId: string): Promise<CollectionNFT> => {
      // Atomicity guard \u2014 prevent double-open
      if (isPackOpening(packId)) {
        return Promise.reject(new Error("Pack is already being opened"));
      }

      return new Promise<CollectionNFT>((resolve, reject) => {
        setSealedPacks((prevPacks) => {
          const pack = prevPacks.find((p) => p.id === packId);
          if (!pack) {
            reject(new Error("Pack not found"));
            return prevPacks;
          }

          // Mark as opening atomically
          markPackOpening(packId);

          // Try backend call if pack has releaseId
          const tryBackend = async (): Promise<CollectionNFT> => {
            // Backend not yet wired for pack opening \u2014 fall through to local
            // When backend is ready, call actor.openPack(packId) here
            throw new Error("backend_not_available");
          };

          tryBackend()
            .then((backendNFT) => {
              // Backend succeeded
              setNfts((prevNfts) => [backendNFT, ...prevNfts]);
              setSealedPacks((prev) => prev.filter((p) => p.id !== packId));
              unmarkPackOpening(packId);
              resolve(backendNFT);
            })
            .catch(() => {
              // Fallback to local pendingNFT (mock/dev packs)
              const freshPack = prevPacks.find((p) => p.id === packId);
              if (!freshPack) {
                unmarkPackOpening(packId);
                reject(new Error("Pack not found during fallback"));
                return;
              }
              const localNFT: CollectionNFT = {
                ...freshPack.pendingNFT,
                addedAt: Date.now(),
              };
              setNfts((prevNfts) => [localNFT, ...prevNfts]);
              setSealedPacks((prev) => prev.filter((p) => p.id !== packId));
              unmarkPackOpening(packId);
              resolve(localNFT);
            });

          // Optimistically remove from sealed list immediately
          // The async resolution above will confirm or restore
          return prevPacks;
        });
      });
    },
    [],
  );

  const removeNFT = useCallback((nftId: string) => {
    setNfts((prev) => prev.filter((n) => n.id !== nftId));
  }, []);

  const removeSealedPacks = useCallback((packIds: string[]) => {
    const idSet = new Set(packIds);
    setSealedPacks((prev) => prev.filter((p) => !idSet.has(p.id)));
  }, []);

  const burnNFT = useCallback((nftId: string) => {
    setNfts((prev) => {
      const nft = prev.find((n) => n.id === nftId);
      if (!nft) return prev;
      // Increment burned count for this NFT id
      setBurnedCounts((prevCounts) => ({
        ...prevCounts,
        [nftId]: (prevCounts[nftId] ?? 0) + 1,
      }));
      return prev.filter((n) => n.id !== nftId);
    });
  }, []);

  return (
    <CollectionContext.Provider
      value={{
        nfts,
        sealedPacks,
        burnedCounts,
        addNFT,
        addNFTs,
        addSealedPacks,
        openPack,
        removeNFT,
        removeSealedPacks,
        burnNFT,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection(): CollectionCtx {
  const ctx = useContext(CollectionContext);
  if (!ctx) {
    throw new Error("useCollection must be used inside CollectionProvider");
  }
  return ctx;
}
