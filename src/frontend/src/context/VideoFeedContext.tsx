import { useActor } from "@caffeineai/core-infrastructure";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { VideoClipSort, createActor } from "../backend";
import type { VideoClip as BackendVideoClip } from "../backend";
import { useTrendingHashtags } from "../hooks/useTrendingHashtags";

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
  };
}

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
  const trendingHashtagObjects = useTrendingHashtags();

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

  // Fetch clips from backend — use hashtag-filtered endpoint when a tag is active
  useEffect(() => {
    if (!actor || isFetching) return;

    setIsLoading(true);

    // Normalize the hashtag: strip leading "#" for the backend call
    const rawTag = activeHashtag ? activeHashtag.replace(/^#+/, "") : null;

    const fetchPromise = rawTag
      ? actor.getClipsForHashtag(rawTag, toBackendSort(activeSort), safeView)
      : actor.getClips(toBackendSort(activeSort), safeView);

    fetchPromise
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
        console.error("[VideoFeed] clip fetch failed:", err);
        // On error fall back to empty rather than crashing — preserve any optimistic clips
        setClips((prev) => prev.filter((c) => c.id.startsWith("optimistic_")));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [actor, isFetching, activeSort, safeView, activeHashtag]);

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
        actor
          .likeClip(id)
          .then((result) => {
            if (result.__kind__ === "ok") {
              // Update with authoritative count from backend
              const newCount = Number(result.ok);
              setClips((prev) =>
                prev.map((c) =>
                  c.id === id ? { ...c, likeCount: newCount } : c,
                ),
              );
            } else {
              // Backend rejected the like (rate limit, duplicate, etc.)
              const errMsg = String(result.err ?? "");
              if (
                errMsg.toLowerCase().includes("rate") ||
                errMsg.toLowerCase().includes("limit")
              ) {
                toast.error("Too many likes — slow down for a moment.");
              } else if (
                errMsg.toLowerCase().includes("already") ||
                errMsg.toLowerCase().includes("duplicate")
              ) {
                toast("You've already liked this clip.");
              } else {
                toast.error("Couldn't like this clip right now.");
              }
              console.warn("[VideoFeed] likeClip rejected:", result.err);
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
            }
          })
          .catch((err) => {
            console.warn("[VideoFeed] likeClip failed:", err);
            // Revert optimistic update on network error
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

  // Derive the flat string list for consumers that only need tag names
  const trendingHashtags = trendingHashtagObjects.map((h) => h.tag);

  // filteredClips: when using hashtag endpoint, clips are already server-filtered.
  // Still apply safeView client-side as a defensive layer, and sort locally.
  const filteredClips = (() => {
    let list = clips.filter((c) => !safeView || !c.explicitFlag);
    if (activeSort === "newest") {
      list = [...list].sort((a, b) => b.timestamp - a.timestamp);
    } else {
      // trending and top both sort by plain likeCount
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
        trendingHashtags,
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
