import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VideoClip {
  id: string;
  videoUrl: string;
  previewUrl: string;
  creatorName: string;
  creatorAvatar: string | null;
  creatorBio: string;
  title: string;
  hashtags: string[];
  explicitFlag: boolean;
  likeCount: number;
  timestamp: number;
  viralScore: number;
}

export type FeedSort = "newest" | "trending" | "top";

interface VideoFeedContextValue {
  clips: VideoClip[];
  likedIds: Set<string>;
  toggleLike: (id: string) => void;
  activeSort: FeedSort;
  setActiveSort: (s: FeedSort) => void;
  activeHashtag: string | null;
  setActiveHashtag: (h: string | null) => void;
  filteredClips: VideoClip[];
  trendingHashtags: string[];
  safeView: boolean;
  setSafeView: (v: boolean) => void;
  addClipToFeed: (clip: VideoClip) => void;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const NOW = Date.now();
const H = 3_600_000;

function viralScore(clip: {
  likeCount: number;
  timestamp: number;
}): number {
  const age = NOW - clip.timestamp;
  const lastHour = age < H ? clip.likeCount * 0.05 : 0;
  const last6h = age < 6 * H ? clip.likeCount * 0.1 : 0;
  const last24h = age < 24 * H ? clip.likeCount * 0.25 : 0;
  return clip.likeCount * 0.6 + last24h + last6h + lastHour;
}

const SEED_CLIPS: VideoClip[] = [
  {
    id: "clip_1",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    previewUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    creatorName: "auroraskies",
    creatorAvatar: null,
    creatorBio: "Chasing light and color wherever it hides 🌅",
    title: "Golden Hour Cascade",
    hashtags: ["#goldenhour", "#nature", "#timelapse"],
    explicitFlag: false,
    likeCount: 4821,
    timestamp: NOW - 1.2 * H,
    viralScore: 0,
  },
  {
    id: "clip_2",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    previewUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    creatorName: "lumenwaves",
    creatorAvatar: null,
    creatorBio: "Urban explorer · street photographer",
    title: "City Lights at Dusk",
    hashtags: ["#citylights", "#urban", "#nightlife"],
    explicitFlag: false,
    likeCount: 3104,
    timestamp: NOW - 3.5 * H,
    viralScore: 0,
  },
  {
    id: "clip_3",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    previewUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    creatorName: "coastaldrift",
    creatorAvatar: null,
    creatorBio: "Living for the salt air and slow waves 🌊",
    title: "Coastal Drift",
    hashtags: ["#coastaldrift", "#ocean", "#summer"],
    explicitFlag: false,
    likeCount: 6290,
    timestamp: NOW - 5 * H,
    viralScore: 0,
  },
  {
    id: "clip_4",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    previewUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    creatorName: "nightrider99",
    creatorAvatar: null,
    creatorBio: "Late nights, fast cars, longer roads 🚗",
    title: "Night Drive Series",
    hashtags: ["#nightdrive", "#citylights", "#cars"],
    explicitFlag: false,
    likeCount: 2877,
    timestamp: NOW - 8 * H,
    viralScore: 0,
  },
  {
    id: "clip_5",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    previewUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    creatorName: "petal.days",
    creatorAvatar: null,
    creatorBio: "Bloom where you're planted 🌸",
    title: "Spring Bloom",
    hashtags: ["#spring", "#nature", "#goldenhour"],
    explicitFlag: false,
    likeCount: 8132,
    timestamp: NOW - 14 * H,
    viralScore: 0,
  },
  {
    id: "clip_6",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    previewUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    creatorName: "desertpulse",
    creatorAvatar: null,
    creatorBio: "Desert frequencies and open skies 🌵",
    title: "Desert Frequencies",
    hashtags: ["#desert", "#roadtrip", "#cars"],
    explicitFlag: false,
    likeCount: 1543,
    timestamp: NOW - 20 * H,
    viralScore: 0,
  },
  {
    id: "clip_7",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    previewUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    creatorName: "neonforests",
    creatorAvatar: null,
    creatorBio: "Infrared · film · dreams 🌿",
    title: "Infrared Forest",
    hashtags: ["#forest", "#nature", "#film"],
    explicitFlag: false,
    likeCount: 5671,
    timestamp: NOW - 30 * H,
    viralScore: 0,
  },
  {
    id: "clip_8",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    previewUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    creatorName: "amberskies",
    creatorAvatar: null,
    creatorBio: "Somewhere between the clouds and the sea ☁️",
    title: "Amber Skies",
    hashtags: ["#amberlight", "#sky", "#goldenhour"],
    explicitFlag: false,
    likeCount: 3400,
    timestamp: NOW - 48 * H,
    viralScore: 0,
  },
].map((c) => ({ ...c, viralScore: viralScore(c) }));

const SEED_IDS = new Set(SEED_CLIPS.map((c) => c.id));

const TRENDING_HASHTAGS = [
  "#goldenhour",
  "#citylights",
  "#coastaldrift",
  "#nature",
  "#nightdrive",
  "#ocean",
  "#roadtrip",
  "#desert",
];

const LS_LIKED_KEY = "minty_feed_liked_v1";
const LS_SAFE_KEY = "minty_feed_safevew_v1";
const LS_MINTED_CLIPS_KEY = "minty_feed_minted_v1";

function loadLiked(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_LIKED_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* ignore */
  }
  return new Set();
}

function saveLiked(set: Set<string>) {
  try {
    localStorage.setItem(LS_LIKED_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

/** Load only user-minted clips (not seed clips) from localStorage */
function loadMintedClips(): VideoClip[] {
  try {
    const raw = localStorage.getItem(LS_MINTED_CLIPS_KEY);
    if (raw) return JSON.parse(raw) as VideoClip[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveMintedClips(clips: VideoClip[]) {
  try {
    localStorage.setItem(LS_MINTED_CLIPS_KEY, JSON.stringify(clips));
  } catch {
    /* ignore */
  }
}

/** Merge minted clips (front) with seed clips (back), deduplicating by id */
function buildInitialClips(minted: VideoClip[]): VideoClip[] {
  const seen = new Set<string>();
  const result: VideoClip[] = [];
  for (const c of minted) {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      result.push(c);
    }
  }
  for (const c of SEED_CLIPS) {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      result.push(c);
    }
  }
  return result;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const VideoFeedCtx = createContext<VideoFeedContextValue | null>(null);

export function VideoFeedProvider({ children }: { children: React.ReactNode }) {
  const [clips, setClips] = useState<VideoClip[]>(() =>
    buildInitialClips(loadMintedClips()),
  );
  const [likedIds, setLikedIds] = useState<Set<string>>(loadLiked);
  const [activeSort, setActiveSort] = useState<FeedSort>("newest");
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const [safeView, setSafeViewState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LS_SAFE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const setSafeView = useCallback((v: boolean) => {
    setSafeViewState(v);
    try {
      localStorage.setItem(LS_SAFE_KEY, v ? "true" : "false");
    } catch {
      /* ignore */
    }
  }, []);

  // Use a ref to avoid stale closure in toggleLike
  const likedIdsRef = useRef(likedIds);
  useEffect(() => {
    likedIdsRef.current = likedIds;
  }, [likedIds]);

  const toggleLikeStable = useCallback((id: string) => {
    const wasLiked = likedIdsRef.current.has(id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(id);
      else next.add(id);
      saveLiked(next);
      return next;
    });
    setClips((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, likeCount: c.likeCount + (wasLiked ? -1 : 1) }
          : c,
      ),
    );
  }, []);

  /**
   * Insert a newly minted clip at the front of the feed and persist it so it
   * survives page refreshes. Silently skips if the id already exists.
   */
  const addClipToFeed = useCallback((clip: VideoClip) => {
    setClips((prev) => {
      if (prev.some((c) => c.id === clip.id)) return prev;
      const next = [clip, ...prev];
      // Persist only the non-seed clips
      const minted = next.filter((c) => !SEED_IDS.has(c.id));
      saveMintedClips(minted);
      return next;
    });
  }, []);

  const filteredClips = (() => {
    let list = clips.filter((c) => !safeView || !c.explicitFlag);
    if (activeHashtag) {
      list = list.filter((c) => c.hashtags.includes(activeHashtag));
    }
    if (activeSort === "newest") {
      list = [...list].sort((a, b) => b.timestamp - a.timestamp);
    } else if (activeSort === "trending") {
      list = [...list].sort((a, b) => b.viralScore - a.viralScore);
    } else {
      list = [...list].sort((a, b) => b.likeCount - a.likeCount);
    }
    return list;
  })();

  return (
    <VideoFeedCtx.Provider
      value={{
        clips,
        likedIds,
        toggleLike: toggleLikeStable,
        activeSort,
        setActiveSort,
        activeHashtag,
        setActiveHashtag,
        filteredClips,
        trendingHashtags: TRENDING_HASHTAGS,
        safeView,
        setSafeView,
        addClipToFeed,
      }}
    >
      {children}
    </VideoFeedCtx.Provider>
  );
}

export function useVideoFeed() {
  const ctx = useContext(VideoFeedCtx);
  if (!ctx)
    throw new Error("useVideoFeed must be used inside VideoFeedProvider");
  return ctx;
}
