import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LS_KEY = "minty_releases";
const LS_SEEDED_KEY = "minty_releases_seeded_v3";
const LS_LIKED_KEY = "minty_releases_liked";

export interface MarketRelease {
  id: string;
  creatorName: string;
  creatorId: string;
  coverImageUrl: string;
  previewClipUrl?: string;
  title: string;
  caption: string;
  setName: string;
  packsAvailable: number;
  packCount: number;
  packIds: string[];
  priceUsd: number;
  listedAt: number;
  expiresAt: number;
  status: "active" | "burned" | "sold_out";
  collectibleType: "photo" | "video";
  explicit: boolean;
  hashtags: string[];
  lastPurchaseAt?: number;
  likes: number;
  // Weekly Round fields
  roundId?: number;
  isTop10?: boolean;
  isDeletedAfterRound?: boolean;
}

interface ReleasesMarketCtx {
  releases: MarketRelease[];
  likedIds: Set<string>;
  addRelease: (r: MarketRelease) => void;
  buyPack: (releaseId: string) => void;
  buyPacks: (releaseId: string, qty: number) => void;
  burnExpired: () => void;
  likeRelease: (id: string) => void;
  finalizeRound: (endingRoundId: number) => void;
}

const ReleasesMarketContext = createContext<ReleasesMarketCtx | null>(null);

const NOW = Date.now();
const H = 3600000;
const YEAR_MS = 365 * 24 * H;

const SEED_RELEASES: MarketRelease[] = [
  {
    id: "release_seed_1",
    creatorName: "arctic.icp",
    creatorId: "arctic.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Northern Lights",
    caption: "Aurora borealis over the tundra",
    setName: "Arctic Visions Vol. 1",
    packsAvailable: 247,
    packCount: 300,
    packIds: [],
    priceUsd: 1,
    listedAt: NOW - 2 * H,
    expiresAt: NOW + YEAR_MS,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    hashtags: ["aurora", "arctic", "northernlights"],
    lastPurchaseAt: NOW - 4 * 60 * 1000,
    likes: 12482,
    roundId: 1,
    isTop10: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_2",
    creatorName: "solstice",
    creatorId: "solstice.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    title: "Midsummer Drift",
    caption: "Endless golden hour",
    setName: "Solstice Series",
    packsAvailable: 210,
    packCount: 300,
    packIds: [],
    priceUsd: 1,
    listedAt: NOW - 18 * H,
    expiresAt: NOW + YEAR_MS,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    hashtags: ["solstice", "midsummer", "goldenhour"],
    lastPurchaseAt: NOW - 22 * 60 * 1000,
    likes: 8301,
    roundId: 1,
    isTop10: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_3",
    creatorName: "drifter.icp",
    creatorId: "drifter.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Coastal Fog",
    caption: "Morning fog rolling in off the Pacific",
    setName: "West Coast Mornings",
    packsAvailable: 89,
    packCount: 300,
    packIds: [],
    priceUsd: 1,
    listedAt: NOW - 0.5 * H,
    expiresAt: NOW + YEAR_MS,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    hashtags: ["coastalfog", "pacific", "morningvibes"],
    lastPurchaseAt: NOW - 2 * 60 * 60 * 1000,
    likes: 6744,
    roundId: 1,
    isTop10: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_4",
    creatorName: "nova_clips",
    creatorId: "nova_clips.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    title: "Supernova Pulse",
    caption: "Light bending through deep space",
    setName: "Nova Series",
    packsAvailable: 280,
    packCount: 300,
    packIds: [],
    priceUsd: 1,
    listedAt: NOW - 1 * H,
    expiresAt: NOW + YEAR_MS,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    hashtags: ["supernova", "space", "cosmos"],
    likes: 3210,
    roundId: 1,
    isTop10: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_5",
    creatorName: "east.light",
    creatorId: "east.light.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Ryokan Morning",
    caption: "First light over the mountain inn",
    setName: "East Series",
    packsAvailable: 155,
    packCount: 300,
    packIds: [],
    priceUsd: 1,
    listedAt: NOW - 3 * H,
    expiresAt: NOW + YEAR_MS,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    hashtags: ["ryokan", "japan", "morning"],
    likes: 1987,
    roundId: 1,
    isTop10: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_6",
    creatorName: "pulse_rider",
    creatorId: "pulse_rider.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    title: "Night Circuit",
    caption: "Neon city lights at 2am",
    setName: "Pulse Nights",
    packsAvailable: 200,
    packCount: 300,
    packIds: [],
    priceUsd: 1,
    listedAt: NOW - 6 * H,
    expiresAt: NOW + YEAR_MS,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    hashtags: ["nightcircuit", "neon", "citylights"],
    likes: 1203,
    roundId: 1,
    isTop10: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_7",
    creatorName: "velvet_fog",
    creatorId: "velvet_fog.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Velvet Hour",
    caption: "Fog settling over the valley",
    setName: "Velvet Fog Collection",
    packsAvailable: 175,
    packCount: 300,
    packIds: [],
    priceUsd: 1,
    listedAt: NOW - 12 * H,
    expiresAt: NOW + YEAR_MS,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    hashtags: ["velvet", "fog", "valley"],
    likes: 870,
    roundId: 1,
    isTop10: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_8",
    creatorName: "mintcreator",
    creatorId: "mintcreator.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    title: "Sunset Ride",
    caption: "Late summer drive along the coast",
    setName: "Coastal Drift Vol. 1",
    packsAvailable: 247,
    packCount: 300,
    packIds: [],
    priceUsd: 1,
    listedAt: NOW - 24 * H,
    expiresAt: NOW + YEAR_MS,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    hashtags: ["coastaldrift", "sunsetride", "goldenhour"],
    likes: 512,
    roundId: 1,
    isTop10: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_9",
    creatorName: "neon_rider",
    creatorId: "neon_rider.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "First Mint Moment",
    caption: "Late night drive",
    setName: "Night Drive Series",
    packsAvailable: 171,
    packCount: 300,
    packIds: [],
    priceUsd: 1,
    listedAt: NOW - 36 * H,
    expiresAt: NOW + YEAR_MS,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    hashtags: ["nightdrive", "citylights", "latevibes"],
    likes: 241,
    roundId: 1,
    isTop10: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_10",
    creatorName: "light.icp",
    creatorId: "light.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    title: "Golden Hour",
    caption: "Golden hour at the lake",
    setName: "Golden Hour Set",
    packsAvailable: 89,
    packCount: 300,
    packIds: [],
    priceUsd: 1,
    listedAt: NOW - 48 * H,
    expiresAt: NOW + YEAR_MS,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    hashtags: ["goldenhour", "fogseason", "earlylight"],
    likes: 87,
    roundId: 1,
    isTop10: false,
    isDeletedAfterRound: false,
  },
];

function loadReleasesFromStorage(): MarketRelease[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const releases = JSON.parse(raw) as MarketRelease[];
    return releases.map((r) => ({
      ...r,
      explicit: r.explicit ?? false,
      creatorId: r.creatorId ?? r.creatorName,
      packCount: r.packCount ?? r.packsAvailable,
      hashtags: r.hashtags ?? [],
      likes: r.likes ?? 0,
      roundId: r.roundId ?? undefined,
      isTop10: r.isTop10 ?? false,
      isDeletedAfterRound: r.isDeletedAfterRound ?? false,
    }));
  } catch {
    return [];
  }
}

function saveReleasesToStorage(releases: MarketRelease[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(releases));
  } catch {
    // ignore
  }
}

function loadLikedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_LIKED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveLikedIds(ids: Set<string>) {
  try {
    localStorage.setItem(LS_LIKED_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

export function ReleasesMarketProvider({
  children,
}: { children: React.ReactNode }) {
  const [releases, setReleases] = useState<MarketRelease[]>(() =>
    loadReleasesFromStorage(),
  );
  const [likedIds, setLikedIds] = useState<Set<string>>(() => loadLikedIds());

  // Seed on first mount (v3 key forces re-seed for existing users)
  useEffect(() => {
    const alreadySeeded = localStorage.getItem(LS_SEEDED_KEY);
    if (!alreadySeeded) {
      // Clear old seed data first
      localStorage.removeItem("minty_releases_seeded");
      localStorage.removeItem("minty_releases_seeded_v2");
      setReleases(() => [...SEED_RELEASES]);
      localStorage.setItem(LS_SEEDED_KEY, "1");
    }
  }, []);

  // Persist releases
  useEffect(() => {
    saveReleasesToStorage(releases);
  }, [releases]);

  // Persist liked ids
  useEffect(() => {
    saveLikedIds(likedIds);
  }, [likedIds]);

  const addRelease = useCallback((r: MarketRelease) => {
    setReleases((prev) => [r, ...prev]);
  }, []);

  const buyPack = useCallback((releaseId: string) => {
    setReleases((prev) =>
      prev.map((r) => {
        if (r.id !== releaseId) return r;
        const newCount = r.packsAvailable - 1;
        return {
          ...r,
          packsAvailable: newCount,
          status: newCount <= 0 ? "sold_out" : r.status,
          lastPurchaseAt: Date.now(),
        };
      }),
    );
  }, []);

  const buyPacks = useCallback((releaseId: string, qty: number) => {
    setReleases((prev) =>
      prev.map((r) => {
        if (r.id !== releaseId) return r;
        const newCount = r.packsAvailable - qty;
        return {
          ...r,
          packsAvailable: Math.max(0, newCount),
          status: newCount <= 0 ? "sold_out" : r.status,
          lastPurchaseAt: Date.now(),
        };
      }),
    );
  }, []);

  const burnExpired = useCallback(() => {
    const now = Date.now();
    setReleases((prev) =>
      prev.map((r) => {
        if (r.status === "active" && r.expiresAt < now) {
          return { ...r, status: "burned" };
        }
        return r;
      }),
    );
  }, []);

  const likeRelease = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        // Unlike
        next.delete(id);
        setReleases((rs) =>
          rs.map((r) =>
            r.id === id ? { ...r, likes: Math.max(0, r.likes - 1) } : r,
          ),
        );
      } else {
        // Like
        next.add(id);
        setReleases((rs) =>
          rs.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r)),
        );
      }
      return next;
    });
  }, []);

  const finalizeRound = useCallback((endingRoundId: number) => {
    setReleases((prev) => {
      // Get all releases in this round that aren't already deleted
      const roundReleases = prev.filter(
        (r) => r.roundId === endingRoundId && !r.isDeletedAfterRound,
      );

      // Sort by likes descending
      const sorted = [...roundReleases].sort((a, b) => b.likes - a.likes);

      // Top 10 IDs
      const top10Ids = new Set(sorted.slice(0, 10).map((r) => r.id));

      return prev.map((r) => {
        if (r.roundId !== endingRoundId || r.isDeletedAfterRound) return r;
        if (top10Ids.has(r.id)) {
          return { ...r, isTop10: true };
        }
        return { ...r, isDeletedAfterRound: true };
      });
    });
  }, []);

  return (
    <ReleasesMarketContext.Provider
      value={{
        releases,
        likedIds,
        addRelease,
        buyPack,
        buyPacks,
        burnExpired,
        likeRelease,
        finalizeRound,
      }}
    >
      {children}
    </ReleasesMarketContext.Provider>
  );
}

export function useReleasesMarket(): ReleasesMarketCtx {
  const ctx = useContext(ReleasesMarketContext);
  if (!ctx) {
    throw new Error(
      "useReleasesMarket must be used inside ReleasesMarketProvider",
    );
  }
  return ctx;
}

// Keep calcPackPrice exported for compatibility
export function calcPackPrice(
  _packsSold: number,
  _totalPacks = 300,
  basePrice = 1,
  _maxPrice = 1,
): number {
  return basePrice;
}

export const BONDING_CURVE_CONFIG = {
  totalPacks: 300,
  basePrice: 1,
  maxPrice: 1,
} as const;
