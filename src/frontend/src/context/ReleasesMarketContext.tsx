import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const LS_KEY = "minty_releases";
const LS_SEEDED_KEY = "minty_releases_seeded_v3";
const LS_LIKED_KEY = "minty_releases_liked";
const LS_ACCOUNT_CREATED = "minty_account_created_at";
const LS_LIKE_TIMESTAMPS_GLOBAL = "minty_like_timestamps_global";
const LS_MINT_TIMESTAMPS = "minty_mint_timestamps";
const LS_IMAGE_HASHES = "minty_image_hashes";
const LS_LIKE_TIMESTAMPS_PER_NFT = "minty_like_timestamps_per_nft";

export interface MarketRelease {
  id: string;
  creatorName: string;
  creatorId: string;
  coverImageUrl: string;
  previewClipUrl?: string;
  videoUrl?: string;
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
  isTop25?: boolean;
  isDeletedAfterRound?: boolean;
  // Viral score fields
  likesLastHour?: number;
  likesLast6Hours?: number;
  likesLast24Hours?: number;
  hadNumberOne?: boolean;
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
  // Anti-spam
  checkAndRecordMint: () => { allowed: boolean; message: string };
  checkImageHash: (hash: string, roundId: number) => { allowed: boolean };
  recordImageHash: (hash: string, roundId: number) => void;
  isLikeRateLimited: boolean;
  likeRateLimitSecondsLeft: number;
  isNewAccount: boolean;
  canLike: (releaseId: string) => { allowed: boolean; reason?: string };
  // Viral score
  viralScore: (release: MarketRelease) => number;
}

const ReleasesMarketContext = createContext<ReleasesMarketCtx | null>(null);

const NOW = Date.now();
const H = 3600000;
const YEAR_MS = 365 * 24 * H;

// Helper: generate fake like timestamps with recency bias
function generateFakeTimestamps(totalLikes: number, spanMs: number): number[] {
  const now = Date.now();
  const count = Math.min(totalLikes, 200); // cap to avoid bloat
  const timestamps: number[] = [];
  for (let i = 0; i < count; i++) {
    // Recency bias: more recent timestamps are more probable
    const u = Math.random();
    const biased = u * u; // squash toward 0 = recent
    const offset = biased * spanMs;
    timestamps.push(now - offset);
  }
  return timestamps.sort((a, b) => a - b);
}

const SEED_RELEASES: MarketRelease[] = [
  {
    id: "release_seed_1",
    creatorName: "arctic.icp",
    creatorId: "arctic.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
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
    collectibleType: "video",
    explicit: false,
    hashtags: ["aurora", "arctic", "northernlights"],
    lastPurchaseAt: NOW - 4 * 60 * 1000,
    likes: 12482,
    roundId: 1,
    isTop10: false,
    isTop25: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_2",
    creatorName: "solstice",
    creatorId: "solstice.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
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
    collectibleType: "video",
    explicit: false,
    hashtags: ["solstice", "midsummer", "goldenhour"],
    lastPurchaseAt: NOW - 22 * 60 * 1000,
    likes: 8301,
    roundId: 1,
    isTop10: false,
    isTop25: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_3",
    creatorName: "drifter.icp",
    creatorId: "drifter.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
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
    collectibleType: "video",
    explicit: false,
    hashtags: ["coastalfog", "pacific", "morningvibes"],
    lastPurchaseAt: NOW - 2 * 60 * 60 * 1000,
    likes: 6744,
    roundId: 1,
    isTop10: false,
    isTop25: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_4",
    creatorName: "nova_clips",
    creatorId: "nova_clips.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
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
    collectibleType: "video",
    explicit: false,
    hashtags: ["supernova", "space", "cosmos"],
    likes: 3210,
    roundId: 1,
    isTop10: false,
    isTop25: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_5",
    creatorName: "east.light",
    creatorId: "east.light.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
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
    collectibleType: "video",
    explicit: false,
    hashtags: ["ryokan", "japan", "morning"],
    likes: 1987,
    roundId: 1,
    isTop10: false,
    isTop25: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_6",
    creatorName: "pulse_rider",
    creatorId: "pulse_rider.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
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
    collectibleType: "video",
    explicit: false,
    hashtags: ["nightcircuit", "neon", "citylights"],
    likes: 1203,
    roundId: 1,
    isTop10: false,
    isTop25: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_7",
    creatorName: "velvet_fog",
    creatorId: "velvet_fog.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
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
    collectibleType: "video",
    explicit: false,
    hashtags: ["velvet", "fog", "valley"],
    likes: 870,
    roundId: 1,
    isTop10: false,
    isTop25: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_8",
    creatorName: "mintcreator",
    creatorId: "mintcreator.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
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
    collectibleType: "video",
    explicit: false,
    hashtags: ["coastaldrift", "sunsetride", "goldenhour"],
    likes: 512,
    roundId: 1,
    isTop10: false,
    isTop25: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_9",
    creatorName: "neon_rider",
    creatorId: "neon_rider.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
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
    collectibleType: "video",
    explicit: false,
    hashtags: ["nightdrive", "citylights", "latevibes"],
    likes: 241,
    roundId: 1,
    isTop10: false,
    isTop25: false,
    isDeletedAfterRound: false,
  },
  {
    id: "release_seed_10",
    creatorName: "light.icp",
    creatorId: "light.icp",
    coverImageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",
    previewClipUrl: "https://www.w3schools.com/html/movie.mp4",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
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
    collectibleType: "video",
    explicit: false,
    hashtags: ["goldenhour", "fogseason", "earlylight"],
    likes: 87,
    roundId: 1,
    isTop10: false,
    isTop25: false,
    isDeletedAfterRound: false,
  },
];

// Seed like timestamps for initial seed releases, with recency bias
const SEED_LIKE_TIMESTAMPS: Record<string, number[]> = {
  release_seed_1: generateFakeTimestamps(12482, 7 * 24 * H),
  release_seed_2: generateFakeTimestamps(8301, 7 * 24 * H),
  release_seed_3: generateFakeTimestamps(6744, 7 * 24 * H),
  release_seed_4: generateFakeTimestamps(3210, 7 * 24 * H),
  release_seed_5: generateFakeTimestamps(1987, 7 * 24 * H),
  release_seed_6: generateFakeTimestamps(1203, 7 * 24 * H),
  release_seed_7: generateFakeTimestamps(870, 7 * 24 * H),
  release_seed_8: generateFakeTimestamps(512, 7 * 24 * H),
  release_seed_9: generateFakeTimestamps(241, 7 * 24 * H),
  release_seed_10: generateFakeTimestamps(87, 7 * 24 * H),
};

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
      isTop25: r.isTop25 ?? false,
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

function loadOrInitAccountCreated(): number {
  try {
    const raw = localStorage.getItem(LS_ACCOUNT_CREATED);
    if (raw) return Number(raw);
    const ts = Date.now();
    localStorage.setItem(LS_ACCOUNT_CREATED, String(ts));
    return ts;
  } catch {
    return Date.now();
  }
}

function loadLikeTimestampsGlobal(): number[] {
  try {
    const raw = localStorage.getItem(LS_LIKE_TIMESTAMPS_GLOBAL);
    if (!raw) return [];
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

function saveLikeTimestampsGlobal(ts: number[]) {
  try {
    localStorage.setItem(LS_LIKE_TIMESTAMPS_GLOBAL, JSON.stringify(ts));
  } catch {}
}

function loadMintTimestamps(): number[] {
  try {
    const raw = localStorage.getItem(LS_MINT_TIMESTAMPS);
    if (!raw) return [];
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

function saveMintTimestamps(ts: number[]) {
  try {
    localStorage.setItem(LS_MINT_TIMESTAMPS, JSON.stringify(ts));
  } catch {}
}

function loadImageHashes(): Record<number, string[]> {
  try {
    const raw = localStorage.getItem(LS_IMAGE_HASHES);
    if (!raw) return {};
    return JSON.parse(raw) as Record<number, string[]>;
  } catch {
    return {};
  }
}

function saveImageHashes(hashes: Record<number, string[]>) {
  try {
    localStorage.setItem(LS_IMAGE_HASHES, JSON.stringify(hashes));
  } catch {}
}

function loadLikeTimestampsPerNft(): Record<string, number[]> {
  try {
    const raw = localStorage.getItem(LS_LIKE_TIMESTAMPS_PER_NFT);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number[]>;
  } catch {
    return {};
  }
}

function saveLikeTimestampsPerNft(ts: Record<string, number[]>) {
  try {
    localStorage.setItem(LS_LIKE_TIMESTAMPS_PER_NFT, JSON.stringify(ts));
  } catch {}
}

export function ReleasesMarketProvider({
  children,
}: { children: React.ReactNode }) {
  const [releases, setReleases] = useState<MarketRelease[]>(() =>
    loadReleasesFromStorage(),
  );
  const [likedIds, setLikedIds] = useState<Set<string>>(() => loadLikedIds());

  // Anti-spam state
  const accountCreatedAt = useRef<number>(loadOrInitAccountCreated());
  const [likeTimestampsGlobal, setLikeTimestampsGlobal] = useState<number[]>(
    () => loadLikeTimestampsGlobal(),
  );
  const [mintTimestamps, setMintTimestamps] = useState<number[]>(() =>
    loadMintTimestamps(),
  );
  const [imageHashes, setImageHashes] = useState<Record<number, string[]>>(() =>
    loadImageHashes(),
  );
  const [likeTimestampsPerNft, setLikeTimestampsPerNft] = useState<
    Record<string, number[]>
  >(() => {
    const stored = loadLikeTimestampsPerNft();
    // Merge with seed if empty
    const merged: Record<string, number[]> = { ...SEED_LIKE_TIMESTAMPS };
    for (const [k, v] of Object.entries(stored)) {
      merged[k] = v;
    }
    return merged;
  });

  // Rate limit cooldown — timestamp when it lifts
  const [likeRateLimitUntil, setLikeRateLimitUntil] = useState<number>(0);
  // Live tick for seconds-left countdown
  const [now, setNow] = useState<number>(() => Date.now());

  // Tick every second to update countdown displays
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Derived: is the account too new (< 60 seconds old)
  const isNewAccount = useMemo(
    () => now - accountCreatedAt.current < 60000,
    [now],
  );

  // Derived: is like rate limited
  const isLikeRateLimited = useMemo(() => {
    if (now < likeRateLimitUntil) return true;
    // Check if 30+ likes in last 60s
    const cutoff = now - 60000;
    const recent = likeTimestampsGlobal.filter((t) => t >= cutoff);
    return recent.length >= 30;
  }, [now, likeRateLimitUntil, likeTimestampsGlobal]);

  const likeRateLimitSecondsLeft = useMemo(() => {
    if (!isLikeRateLimited) return 0;
    if (now < likeRateLimitUntil) {
      return Math.ceil((likeRateLimitUntil - now) / 1000);
    }
    return 60; // Just hit the limit
  }, [isLikeRateLimited, likeRateLimitUntil, now]);

  // Seed on first mount
  useEffect(() => {
    const alreadySeeded = localStorage.getItem(LS_SEEDED_KEY);
    if (!alreadySeeded) {
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

  // Persist like timestamps per NFT
  useEffect(() => {
    saveLikeTimestampsPerNft(likeTimestampsPerNft);
  }, [likeTimestampsPerNft]);

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
    const nowTs = Date.now();
    setReleases((prev) =>
      prev.map((r) => {
        if (r.status === "active" && r.expiresAt < nowTs) {
          return { ...r, status: "burned" };
        }
        return r;
      }),
    );
  }, []);

  // Compute viral score for a release using per-NFT like timestamps
  const viralScore = useCallback(
    (release: MarketRelease): number => {
      const ts = likeTimestampsPerNft[release.id] ?? [];
      const nowTs = Date.now();
      const likesLastHour = ts.filter((t) => t >= nowTs - H).length;
      const likesLast6Hours = ts.filter((t) => t >= nowTs - 6 * H).length;
      const likesLast24Hours = ts.filter((t) => t >= nowTs - 24 * H).length;
      return (
        release.likes * 0.6 +
        likesLast24Hours * 0.25 +
        likesLast6Hours * 0.1 +
        likesLastHour * 0.05
      );
    },
    [likeTimestampsPerNft],
  );

  const likeRelease = useCallback(
    (id: string) => {
      const nowTs = Date.now();
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
          // Like — record timestamps
          next.add(id);

          // Update global like timestamps (trim > 24h old)
          const cutoff24h = nowTs - 24 * H;
          setLikeTimestampsGlobal((prev) => {
            const trimmed = prev.filter((t) => t >= cutoff24h);
            const updated = [...trimmed, nowTs];
            // Check if we just crossed the rate limit threshold
            const last60s = updated.filter((t) => t >= nowTs - 60000);
            if (last60s.length >= 30) {
              setLikeRateLimitUntil(nowTs + 60000);
            }
            saveLikeTimestampsGlobal(updated);
            return updated;
          });

          // Update per-NFT like timestamps
          setLikeTimestampsPerNft((prev) => {
            const existing = prev[id] ?? [];
            const updated = { ...prev, [id]: [...existing, nowTs] };
            return updated;
          });

          // Update like count and check if this is now #1 by viral score
          setReleases((rs) => {
            const updated = rs.map((r) =>
              r.id === id ? { ...r, likes: r.likes + 1 } : r,
            );
            // Compute viral scores to check for #1
            const currentRound = updated.find((r) => r.id === id)?.roundId;
            if (currentRound !== undefined) {
              const roundReleases = updated.filter(
                (r) => r.roundId === currentRound && !r.isDeletedAfterRound,
              );
              // Find the release with the highest likes in the round
              const topByLikes = roundReleases.reduce(
                (best, r) => (r.likes > (best?.likes ?? -1) ? r : best),
                null as MarketRelease | null,
              );
              if (topByLikes?.id === id) {
                return updated.map((r) =>
                  r.id === id ? { ...r, hadNumberOne: true } : r,
                );
              }
            }
            return updated;
          });
        }
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Anti-spam: check and record a mint attempt
  const checkAndRecordMint = useCallback((): {
    allowed: boolean;
    message: string;
  } => {
    const nowTs = Date.now();
    const tenMinAgo = nowTs - 10 * 60 * 1000;
    const recent = mintTimestamps.filter((t) => t >= tenMinAgo);
    if (recent.length >= 10) {
      return {
        allowed: false,
        message: "Mint limit reached. Try again shortly.",
      };
    }
    const updated = [...recent, nowTs];
    setMintTimestamps(updated);
    saveMintTimestamps(updated);
    return { allowed: true, message: "" };
  }, [mintTimestamps]);

  // Anti-spam: check if an image hash already exists for a round
  const checkImageHash = useCallback(
    (hash: string, roundId: number): { allowed: boolean } => {
      const hashes = imageHashes[roundId] ?? [];
      return { allowed: !hashes.includes(hash) };
    },
    [imageHashes],
  );

  // Anti-spam: record an image hash for a round
  const recordImageHash = useCallback((hash: string, roundId: number): void => {
    setImageHashes((prev) => {
      const existing = prev[roundId] ?? [];
      if (existing.includes(hash)) return prev;
      const updated = { ...prev, [roundId]: [...existing, hash] };
      saveImageHashes(updated);
      return updated;
    });
  }, []);

  // canLike: checks all conditions before a like
  const canLike = useCallback(
    (_releaseId: string): { allowed: boolean; reason?: string } => {
      if (isNewAccount) {
        return { allowed: false, reason: "Account too new" };
      }
      if (isLikeRateLimited) {
        return { allowed: false, reason: "Rate limited" };
      }
      // One-like-per-NFT is handled by likedIds
      return { allowed: true };
    },
    [isNewAccount, isLikeRateLimited],
  );

  const finalizeRound = useCallback((endingRoundId: number) => {
    setReleases((prev) => {
      const roundReleases = prev.filter(
        (r) => r.roundId === endingRoundId && !r.isDeletedAfterRound,
      );
      const sorted = [...roundReleases].sort((a, b) => b.likes - a.likes);
      // Top 25 survive
      const top25Ids = new Set(sorted.slice(0, 25).map((r) => r.id));

      return prev.map((r) => {
        if (r.roundId !== endingRoundId || r.isDeletedAfterRound) return r;
        if (top25Ids.has(r.id)) {
          return { ...r, isTop10: true, isTop25: true };
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
        checkAndRecordMint,
        checkImageHash,
        recordImageHash,
        isLikeRateLimited,
        likeRateLimitSecondsLeft,
        isNewAccount,
        canLike,
        viralScore,
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
