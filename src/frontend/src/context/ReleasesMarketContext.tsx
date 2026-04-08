import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const LS_KEY = "minty_releases";
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
  hashtags: string[]; // structured hashtags, e.g. ["nightdrive", "citylights"]
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

function loadReleasesFromStorage(): MarketRelease[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const releases = JSON.parse(raw) as MarketRelease[];
    // Backfill fields for releases stored before feature additions
    return releases.map((r) => ({
      ...r,
      explicit: r.explicit ?? false,
      creatorId: r.creatorId ?? r.creatorName,
      packCount: r.packCount ?? r.packsAvailable,
      hashtags: r.hashtags ?? [],
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
