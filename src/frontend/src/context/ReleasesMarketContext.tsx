import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LS_KEY = "minty_releases";
const LS_SEEDED_KEY = "minty_releases_seeded";

export interface MarketRelease {
  id: string;
  creatorName: string;
  coverImageUrl: string;
  previewClipUrl?: string;
  title: string;
  caption: string;
  setName: string;
  packsAvailable: number;
  packIds: string[];
  priceUsd: number;
  listedAt: number;
  expiresAt: number;
  status: "active" | "burned" | "sold_out";
  collectibleType: "photo" | "video";
}

interface ReleasesMarketCtx {
  releases: MarketRelease[];
  addRelease: (r: MarketRelease) => void;
  buyPack: (releaseId: string) => void;
  burnExpired: () => void;
}

const ReleasesMarketContext = createContext<ReleasesMarketCtx | null>(null);

const NOW = Date.now();
const H = 3600000; // 1 hour in ms

const SEED_RELEASES: MarketRelease[] = [
  {
    id: "release_seed_1",
    creatorName: "mintcreator.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Sunset Ride",
    caption: "9 photos and 1 video from a late summer drive along the coast",
    setName: "Coastal Drift Vol. 1",
    packsAvailable: 5,
    packIds: [],
    priceUsd: 3.5,
    listedAt: NOW - 2 * H,
    expiresAt: NOW - 2 * H + 24 * H,
    status: "active",
    collectibleType: "photo",
  },
  {
    id: "release_seed_2",
    creatorName: "neon_rider.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=400&q=80",
    title: "First Mint Moment",
    caption: "Personal collectible drop from a late night drive",
    setName: "Night Drive Series",
    packsAvailable: 3,
    packIds: [],
    priceUsd: 5.0,
    listedAt: NOW - 18 * H,
    expiresAt: NOW - 18 * H + 24 * H,
    status: "active",
    collectibleType: "video",
  },
  {
    id: "release_seed_3",
    creatorName: "light.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80",
    title: "Golden Hour",
    caption: "Limited Mint Moment — golden hour at the lake",
    setName: "Golden Hour Set",
    packsAvailable: 8,
    packIds: [],
    priceUsd: 2.0,
    listedAt: NOW - 0.5 * H,
    expiresAt: NOW - 0.5 * H + 24 * H,
    status: "active",
    collectibleType: "photo",
  },
];

function loadReleasesFromStorage(): MarketRelease[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MarketRelease[];
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
      value={{ releases, addRelease, buyPack, burnExpired }}
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
