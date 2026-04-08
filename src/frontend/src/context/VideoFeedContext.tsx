import { useActor } from "@caffeineai/core-infrastructure";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { VideoClipSort, createActor } from "../backend";
import type { VideoClip as BackendVideoClip } from "../backend";

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
  /** Optimistically add a newly minted clip — it will also appear after the next backend refresh */
  addClipToFeed: (clip: VideoClip) => void;
  isLoading: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NOW = Date.now();
const H = 3_600_000;

function computeViralScore(c: {
  likeCount: number;
  timestamp: number;
}): number {
  const age = NOW - c.timestamp;
  const lastHour = age < H ? c.likeCount * 0.05 : 0;
  const last6h = age < 6 * H ? c.likeCount * 0.1 : 0;
  const last24h = age < 24 * H ? c.likeCount * 0.25 : 0;
  return c.likeCount * 0.6 + last24h + last6h + lastHour;
}

function mapBackendClip(bc: BackendVideoClip): VideoClip {
  const likeCount = Number(bc.like_count);
  const timestamp = Number(bc.timestamp);
  return {
    id: bc.clip_id,
    videoUrl: bc.video_file_url,
    previewUrl: bc.preview_loop_url || bc.video_file_url,
    creatorName: bc.creator_principal_id.toString().slice(0, 8),
    creatorAvatar: null,
    creatorBio: "",
    title: bc.title ?? "",
    hashtags: bc.hashtags,
    explicitFlag: bc.explicit_flag,
    likeCount,
    timestamp,
    viralScore: computeViralScore({ likeCount, timestamp }),
  };
}

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

// Map FeedSort → VideoClipSort for backend (module-level to avoid useEffect dep issues)
function toBackendSort(sort: FeedSort): VideoClipSort {
  if (sort === "trending") return VideoClipSort.trending;
  if (sort === "top") return VideoClipSort.top;
  return VideoClipSort.newest;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const VideoFeedCtx = createContext<VideoFeedContextValue | null>(null);

export function VideoFeedProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor(createActor);

  const [clips, setClips] = useState<VideoClip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch clips from backend whenever sort or safeView changes
  useEffect(() => {
    if (!actor || isFetching) return;

    setIsLoading(true);
    actor
      .getClips(toBackendSort(activeSort), safeView)
      .then((backendClips) => {
        setClips((prev) => {
          // Merge: keep optimistic clips that aren't in the backend response yet
          const backendIds = new Set(backendClips.map((c) => c.clip_id));
          const optimistic = prev.filter(
            (c) => c.id.startsWith("optimistic_") && !backendIds.has(c.id),
          );
          const mapped = backendClips.map(mapBackendClip);
          return [...optimistic, ...mapped];
        });
      })
      .catch((err) => {
        console.error("[VideoFeed] getClips failed:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [actor, isFetching, activeSort, safeView]);

  // Use a ref to avoid stale closure in toggleLike
  const likedIdsRef = useRef(likedIds);
  useEffect(() => {
    likedIdsRef.current = likedIds;
  }, [likedIds]);

  const toggleLikeStable = useCallback(
    (id: string) => {
      const wasLiked = likedIdsRef.current.has(id);

      // Optimistic local update
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

      // Sync to backend (only like, not unlike — backend enforces one like)
      if (!wasLiked && actor) {
        actor.likeClip(id).catch((err) => {
          console.warn("[VideoFeed] likeClip failed:", err);
          // Revert optimistic update
          setLikedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            saveLiked(next);
            return next;
          });
          setClips((prev) =>
            prev.map((c) =>
              c.id === id ? { ...c, likeCount: c.likeCount - 1 } : c,
            ),
          );
        });
      }
    },
    [actor],
  );

  /**
   * Optimistically insert a newly minted clip at the top of the feed.
   * The clip will be merged with the real backend data on the next refresh.
   */
  const addClipToFeed = useCallback((clip: VideoClip) => {
    setClips((prev) => {
      if (prev.some((c) => c.id === clip.id)) return prev;
      return [{ ...clip, id: `optimistic_${clip.id}` }, ...prev];
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
        isLoading,
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
