import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LS_KEY = "minty_releases";
const LS_SEEDED_KEY = "minty_releases_seeded";
export const BONDING_CURVE_CONFIG = {
  totalPacks: 300,
  basePrice: 10,
  maxPrice: 60,
} as const;

export function calcPackPrice(
  packsSold: number,
  totalPacks: number = BONDING_CURVE_CONFIG.totalPacks,
  basePrice: number = BONDING_CURVE_CONFIG.basePrice,
  maxPrice: number = BONDING_CURVE_CONFIG.maxPrice,
): number {
  const ratio = Math.min(packsSold / totalPacks, 1);
  return basePrice + ratio * ratio * (maxPrice - basePrice);
}

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
  packCount: number; // total packs minted (immutable)
  packIds: string[];
  priceUsd: number;
  listedAt: number; // = createdAt
  expiresAt: number;
  status: "active" | "burned" | "sold_out";
  collectibleType: "photo" | "video";
  explicit: boolean; // content labeling flag
  lastPurchaseAt?: number; // timestamp of last purchase
}

interface ReleasesMarketCtx {
  releases: MarketRelease[];
  addRelease: (r: MarketRelease) => void;
  buyPack: (releaseId: string) => void;
  buyPacks: (releaseId: string, qty: number) => void;
  burnExpired: () => void;
}

const ReleasesMarketContext = createContext<ReleasesMarketCtx | null>(null);

const NOW = Date.now();
const H = 3600000; // 1 hour in ms

const SEED_RELEASES: MarketRelease[] = [
  {
    id: "release_seed_1",
    creatorName: "mintcreator.icp",
    creatorId: "mintcreator.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Sunset Ride",
    caption: "9 photos and 1 video from a late summer drive along the coast",
    setName: "Coastal Drift Vol. 1",
    packsAvailable: 247,
    packCount: 300,
    packIds: [],
    priceUsd: 10,
    listedAt: NOW - 2 * H,
    expiresAt: NOW - 2 * H + 24 * H,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    lastPurchaseAt: NOW - 4 * 60 * 1000,
  },
  {
    id: "release_seed_2",
    creatorName: "neon_rider.icp",
    creatorId: "neon_rider.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=400&q=80",
    title: "First Mint Moment",
    caption: "9 photos + 1 video from a late night drive",
    setName: "Night Drive Series",
    packsAvailable: 171,
    packCount: 300,
    packIds: [],
    priceUsd: 10,
    listedAt: NOW - 18 * H,
    expiresAt: NOW - 18 * H + 24 * H,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    lastPurchaseAt: NOW - 22 * 60 * 1000,
  },
  {
    id: "release_seed_3",
    creatorName: "light.icp",
    creatorId: "light.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80",
    title: "Golden Hour",
    caption: "Limited Mint Moment \u2014 golden hour at the lake",
    setName: "Golden Hour Set",
    packsAvailable: 89,
    packCount: 300,
    packIds: [],
    priceUsd: 10,
    listedAt: NOW - 0.5 * H,
    expiresAt: NOW - 0.5 * H + 24 * H,
    status: "active",
    collectibleType: "photo",
    explicit: false,
    lastPurchaseAt: NOW - 2 * 60 * 60 * 1000,
  },
];

function loadReleasesFromStorage(): MarketRelease[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const releases = JSON.parse(raw) as MarketRelease[];
    // Backfill explicit field for releases stored before this feature
    return releases.map((r) => ({
      ...r,
      explicit: r.explicit ?? false,
      creatorId: r.creatorId ?? r.creatorName,
      packCount: r.packCount ?? r.packsAvailable,
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

export function ReleasesMarketProvider({
  children,
}: { children: React.ReactNode }) {
  const [releases, setReleases] = useState<MarketRelease[]>(() =>
    loadReleasesFromStorage(),
  );

  // Seed on first mount
  useEffect(() => {
    const alreadySeeded = localStorage.getItem(LS_SEEDED_KEY);
    if (!alreadySeeded) {
      setReleases((prev) => [...SEED_RELEASES, ...prev]);
      localStorage.setItem(LS_SEEDED_KEY, "1");
    }
  }, []);

  // Persist
  useEffect(() => {
    saveReleasesToStorage(releases);
  }, [releases]);

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

  return (
    <ReleasesMarketContext.Provider
      value={{ releases, addRelease, buyPack, buyPacks, burnExpired }}
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
