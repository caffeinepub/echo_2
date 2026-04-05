import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LS_KEY = "minty_collection";
const LS_SEEDED_KEY = "minty_collection_seeded";
const LS_PACKS_KEY = "minty_sealed_packs";
const LS_PACKS_SEEDED_KEY = "minty_packs_seeded";
const LS_BURNED_KEY = "minty_burned_counts";
const LS_LB_SEEDED_KEY = "minty_lb_seeded";
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

const MOCK_NFTS: CollectionNFT[] = [
  {
    id: "nft_mock_1",
    title: "Golden Moment #1",
    setName: "Mint Moments Vol. 1",
    editionNumber: 3,
    totalSupply: 100,
    mediaType: "photo",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=60",
    rarity: "Common",
    mintDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    creator: "minty.xyz",
    owners: ["0x3f2a...c8e1", "0xa1b2...d3e4"],
    views: 1243,
    isLeader: true,
    hasOwnershipHistory: true,
    addedAt: Date.now() - 86400000 * 5,
    capturedAt: "2026-04-03T23:42:00Z",
    location: "New York, NY",
  },
  {
    id: "nft_mock_2",
    title: "Glacier Drift",
    setName: "Arctic Series",
    editionNumber: 7,
    totalSupply: 50,
    mediaType: "video",
    imageUrl:
      "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=400&q=60",
    rarity: "Rare",
    mintDate: new Date(Date.now() - 86400000 * 12).toISOString(),
    creator: "minty.xyz",
    owners: ["0x3f2a...c8e1"],
    views: 488,
    isLeader: false,
    hasOwnershipHistory: false,
    addedAt: Date.now() - 86400000 * 12,
    capturedAt: "2026-04-02T14:15:00Z",
    location: "Los Angeles, CA",
  },
  {
    id: "nft_mock_3",
    title: "Sage Leaf",
    setName: "Nature Drop",
    editionNumber: 22,
    totalSupply: 200,
    mediaType: "photo",
    imageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=60",
    rarity: "Common",
    mintDate: new Date(Date.now() - 86400000 * 20).toISOString(),
    creator: "minty.xyz",
    owners: ["0x3f2a...c8e1", "0xd4e5...f6a7", "0xb8c9...0a1b"],
    views: 92,
    isLeader: false,
    hasOwnershipHistory: true,
    addedAt: Date.now() - 86400000 * 20,
    capturedAt: "2026-04-01T09:30:00Z",
    location: "Tokyo, JP",
  },
  {
    id: "nft_mock_4",
    title: "Crystal Mint",
    setName: "Crystal Series",
    editionNumber: 1,
    totalSupply: 25,
    mediaType: "photo",
    imageUrl:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=60",
    rarity: "Common",
    mintDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    creator: "minty.xyz",
    owners: ["0x3f2a...c8e1"],
    views: 3871,
    isLeader: false,
    hasOwnershipHistory: false,
    addedAt: Date.now() - 86400000 * 30,
    capturedAt: "2026-03-05T18:00:00Z",
    location: "Miami, FL",
  },
];

const MOCK_SEALED_PACKS: SealedPack[] = [
  {
    id: "pack_mock_1",
    setName: "Mint Moments Vol. 1",
    editionNumber: 4,
    totalSupply: 100,
    collectibleType: "photo",
    collectibleNumber: 1,
    typeSupply: 90,
    pendingNFT: {
      id: "nft_from_pack_1",
      title: "Sunlit Path",
      setName: "Mint Moments Vol. 1",
      editionNumber: 4,
      totalSupply: 100,
      mediaType: "photo",
      imageUrl:
        "https://images.unsplash.com/photo-1519181245277-cffeb31da2e3?w=400&q=60",
      rarity: "Common",
      mintDate: new Date().toISOString(),
      creator: "minty.xyz",
      owners: ["you"],
      views: 0,
      isLeader: false,
      hasOwnershipHistory: false,
      addedAt: Date.now(),
    },
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "pack_mock_2",
    setName: "Arctic Series",
    editionNumber: 2,
    totalSupply: 50,
    collectibleType: "video",
    collectibleNumber: 1,
    typeSupply: 5,
    pendingNFT: {
      id: "nft_from_pack_2",
      title: "Frozen Drift \u2014 Video Moment",
      setName: "Arctic Series",
      editionNumber: 2,
      totalSupply: 50,
      mediaType: "video",
      imageUrl:
        "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=400&q=60",
      rarity: "Rare",
      mintDate: new Date().toISOString(),
      creator: "minty.xyz",
      owners: ["you"],
      views: 0,
      isLeader: false,
      hasOwnershipHistory: false,
      addedAt: Date.now() - 500,
    },
    createdAt: Date.now() - 1000 * 60 * 30,
  },
];

// Leaderboard seed data — top 10 most valuable moments
const LEADERBOARD_SEED: CollectionNFT[] = [
  {
    id: "lb_1",
    title: "Mountain Twilight",
    setName: "Golden Horizons",
    editionNumber: 1,
    totalSupply: 300,
    mediaType: "video",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=60",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    purchasePrice: 285.0,
    caption:
      "A stunning golden twilight over jagged peaks — captured in perfect stillness.",
    rarity: "Rare",
    mintDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    creator: "naturemints",
    owners: ["0xabc1"],
    views: 8420,
    isLeader: true,
    hasOwnershipHistory: true,
    addedAt: Date.now() - 86400000 * 3,
  },
  {
    id: "lb_2",
    title: "City Pulse",
    setName: "Urban Nights",
    editionNumber: 7,
    totalSupply: 300,
    mediaType: "video",
    imageUrl:
      "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=200&q=60",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    purchasePrice: 241.5,
    caption: "Neon-lit streets blur into rivers of light at 2 AM.",
    rarity: "Rare",
    mintDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    creator: "urbanvisions",
    owners: ["0xdef2"],
    views: 5310,
    isLeader: false,
    hasOwnershipHistory: true,
    addedAt: Date.now() - 86400000 * 7,
  },
  {
    id: "lb_3",
    title: "Aurora Veil",
    setName: "Northern Lights Series",
    editionNumber: 2,
    totalSupply: 300,
    mediaType: "video",
    imageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&q=60",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    purchasePrice: 198.75,
    caption: "Dancing ribbons of green and violet drape the Arctic sky.",
    rarity: "Rare",
    mintDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    creator: "aurorachaser",
    owners: ["0xghi3"],
    views: 9102,
    isLeader: true,
    hasOwnershipHistory: true,
    addedAt: Date.now() - 86400000 * 10,
  },
  {
    id: "lb_4",
    title: "Desert Bloom",
    setName: "Rare Earth Drops",
    editionNumber: 12,
    totalSupply: 300,
    mediaType: "video",
    imageUrl:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&q=60",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    purchasePrice: 167.2,
    caption: "One brief week when the Sahara edge erupts in wildflowers.",
    rarity: "Rare",
    mintDate: new Date(Date.now() - 86400000 * 14).toISOString(),
    creator: "earthdrifter",
    owners: ["0xjkl4"],
    views: 3780,
    isLeader: false,
    hasOwnershipHistory: true,
    addedAt: Date.now() - 86400000 * 14,
  },
  {
    id: "lb_5",
    title: "Fog Season Arrival",
    setName: "Pacific Moments",
    editionNumber: 5,
    totalSupply: 300,
    mediaType: "video",
    imageUrl:
      "https://images.unsplash.com/photo-1519181245277-cffeb31da2e3?w=200&q=60",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    purchasePrice: 142.0,
    caption: "The bay disappears under the first fog bank of November.",
    rarity: "Rare",
    mintDate: new Date(Date.now() - 86400000 * 18).toISOString(),
    creator: "baywatch.nft",
    owners: ["0xmno5"],
    views: 2940,
    isLeader: false,
    hasOwnershipHistory: true,
    addedAt: Date.now() - 86400000 * 18,
  },
  {
    id: "lb_6",
    title: "Summit Break",
    setName: "Golden Horizons",
    editionNumber: 3,
    totalSupply: 300,
    mediaType: "video",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=60",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    purchasePrice: 118.5,
    caption: "Breaking through cloud cover after a 6-hour ascent.",
    rarity: "Rare",
    mintDate: new Date(Date.now() - 86400000 * 22).toISOString(),
    creator: "highaltitude",
    owners: ["0xpqr6"],
    views: 4210,
    isLeader: false,
    hasOwnershipHistory: true,
    addedAt: Date.now() - 86400000 * 22,
  },
  {
    id: "lb_7",
    title: "Late Night Drive",
    setName: "Urban Nights",
    editionNumber: 14,
    totalSupply: 300,
    mediaType: "video",
    imageUrl:
      "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=200&q=60",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    purchasePrice: 95.0,
    caption:
      "Midnight cruise with the windows down and city lights streaming past.",
    rarity: "Common",
    mintDate: new Date(Date.now() - 86400000 * 25).toISOString(),
    creator: "nightdrive.eth",
    owners: ["0xstu7"],
    views: 1870,
    isLeader: false,
    hasOwnershipHistory: true,
    addedAt: Date.now() - 86400000 * 25,
  },
  {
    id: "lb_8",
    title: "Tundra Silence",
    setName: "Northern Lights Series",
    editionNumber: 9,
    totalSupply: 300,
    mediaType: "video",
    imageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&q=60",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    purchasePrice: 72.3,
    caption:
      "Thirty below zero, no wind, just white stillness as far as you can see.",
    rarity: "Common",
    mintDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    creator: "aurorachaser",
    owners: ["0xvwx8"],
    views: 1450,
    isLeader: false,
    hasOwnershipHistory: true,
    addedAt: Date.now() - 86400000 * 30,
  },
  {
    id: "lb_9",
    title: "Golden Ratio",
    setName: "Rare Earth Drops",
    editionNumber: 21,
    totalSupply: 300,
    mediaType: "video",
    imageUrl:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&q=60",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    purchasePrice: 48.9,
    caption: "Symmetry found in a sun-drenched canyon wall at midday.",
    rarity: "Common",
    mintDate: new Date(Date.now() - 86400000 * 35).toISOString(),
    creator: "earthdrifter",
    owners: ["0xyza9"],
    views: 990,
    isLeader: false,
    hasOwnershipHistory: true,
    addedAt: Date.now() - 86400000 * 35,
  },
  {
    id: "lb_10",
    title: "Harbor First Light",
    setName: "Pacific Moments",
    editionNumber: 18,
    totalSupply: 300,
    mediaType: "video",
    imageUrl:
      "https://images.unsplash.com/photo-1519181245277-cffeb31da2e3?w=200&q=60",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    purchasePrice: 27.0,
    caption: "The harbor glows amber seconds before the sun clears the hills.",
    rarity: "Common",
    mintDate: new Date(Date.now() - 86400000 * 40).toISOString(),
    creator: "baywatch.nft",
    owners: ["0xbcd10"],
    views: 620,
    isLeader: false,
    hasOwnershipHistory: true,
    addedAt: Date.now() - 86400000 * 40,
  },
];

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

  // Seed mock NFTs once on first mount
  useEffect(() => {
    const alreadySeeded = localStorage.getItem(LS_SEEDED_KEY);
    if (!alreadySeeded) {
      setNfts((prev) => [...MOCK_NFTS, ...prev]);
      localStorage.setItem(LS_SEEDED_KEY, "1");
    }
  }, []);

  // Seed mock sealed packs once on first mount
  useEffect(() => {
    const alreadySeeded = localStorage.getItem(LS_PACKS_SEEDED_KEY);
    if (!alreadySeeded) {
      setSealedPacks((prev) => [...MOCK_SEALED_PACKS, ...prev]);
      localStorage.setItem(LS_PACKS_SEEDED_KEY, "1");
    }
  }, []);

  // Seed leaderboard NFTs once on first mount
  useEffect(() => {
    const alreadySeeded = localStorage.getItem(LS_LB_SEEDED_KEY);
    if (!alreadySeeded) {
      setNfts((prev) => [...LEADERBOARD_SEED, ...prev]);
      localStorage.setItem(LS_LB_SEEDED_KEY, "1");
    }
  }, []);

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
