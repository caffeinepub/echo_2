import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LS_KEY = "minty_releases";
const LS_SEEDED_KEY = "minty_releases_seeded";
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
  likes: number; // like count, default 0
}

interface ReleasesMarketCtx {
  releases: MarketRelease[];
  likedIds: Set<string>;
  addRelease: (r: MarketRelease) => void;
  buyPack: (releaseId: string) => void;
  buyPacks: (releaseId: string, qty: number) => void;
  burnExpired: () => void;
  likeRelease: (id: string) => void;
}

const ReleasesMarketContext = createContext<ReleasesMarketCtx | null>(null);

const NOW = Date.now();
const H = 3600000;
const YEAR_MS = 365 * 24 * H;

const SEED_RELEASES: MarketRelease[] = [
  {
    id: "release_seed_1",
    creatorName: "mintcreator",
    creatorId: "mintcreator.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Sunset Ride",
    caption: "Late summer drive along the coast",
    setName: "Coastal Drift Vol. 1",
    packsAvailable: 247,
    packCount: 300,
    packIds: [],
    priceUsd: 1,
    listedAt: NOW - 2 * H,
    expiresAt: NOW + YEAR_MS,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    hashtags: ["coastaldrift", "sunsetride", "goldenhour"],
    lastPurchaseAt: NOW - 4 * 60 * 1000,
    likes: 241,
  },
  {
    id: "release_seed_2",
    creatorName: "neon_rider",
    creatorId: "neon_rider.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    title: "First Mint Moment",
    caption: "Late night drive",
    setName: "Night Drive Series",
    packsAvailable: 171,
    packCount: 300,
    packIds: [],
    priceUsd: 1,
    listedAt: NOW - 18 * H,
    expiresAt: NOW + YEAR_MS,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    hashtags: ["nightdrive", "citylights", "latevibes"],
    lastPurchaseAt: NOW - 22 * 60 * 1000,
    likes: 87,
  },
  {
    id: "release_seed_3",
    creatorName: "light.icp",
    creatorId: "light.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Golden Hour",
    caption: "Golden hour at the lake",
    setName: "Golden Hour Set",
    packsAvailable: 89,
    packCount: 300,
    packIds: [],
    priceUsd: 1,
    listedAt: NOW - 0.5 * H,
    expiresAt: NOW + YEAR_MS,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    hashtags: ["goldenhour", "fogseason", "earlylight"],
    lastPurchaseAt: NOW - 2 * 60 * 60 * 1000,
    likes: 512,
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

  // Seed on first mount
  useEffect(() => {
    const alreadySeeded = localStorage.getItem(LS_SEEDED_KEY);
    if (!alreadySeeded) {
      setReleases((prev) => [...SEED_RELEASES, ...prev]);
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
