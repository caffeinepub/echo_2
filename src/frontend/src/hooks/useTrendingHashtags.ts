import { useActor } from "@caffeineai/core-infrastructure";
import { useEffect, useRef, useState } from "react";
import { createActor } from "../backend";

export interface TrendingHashtag {
  tag: string;
  hot: boolean;
}

const POLL_INTERVAL_MS = 60_000; // refresh every 60 seconds

export function useTrendingHashtags(): TrendingHashtag[] {
  const { actor, isFetching } = useActor(createActor);
  const [hashtags, setHashtags] = useState<TrendingHashtag[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!actor || isFetching) return;

    let cancelled = false;

    async function fetchHashtags() {
      if (!actor) return;
      try {
        const results = await actor.getTrendingHashtagsWithHotFlag();
        if (cancelled) return;
        const mapped: TrendingHashtag[] = results.map(([tag, , isHot]) => ({
          tag: tag.startsWith("#") ? tag : `#${tag}`,
          hot: isHot,
        }));
        setHashtags(mapped);
      } catch (err) {
        console.warn("[useTrendingHashtags] fetch failed:", err);
        // Keep previous value on error — don't reset to empty
      }
    }

    fetchHashtags();
    intervalRef.current = setInterval(fetchHashtags, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [actor, isFetching]);

  return hashtags;
}
