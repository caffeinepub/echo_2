import { useMemo } from "react";
import { useReleasesMarket } from "../context/ReleasesMarketContext";

export interface TrendingHashtag {
  tag: string;
  hot: boolean;
}

const RECENT_PURCHASE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const HOT_THRESHOLD = 4; // score >= 4 gets fire emoji
const TOP_N = 10;

export function useTrendingHashtags(): TrendingHashtag[] {
  const { releases } = useReleasesMarket();

  return useMemo(() => {
    const now = Date.now();
    const scores = new Map<string, number>();

    for (const release of releases) {
      if (release.status !== "active") continue;
      if (!release.hashtags || release.hashtags.length === 0) continue;

      const hasRecentActivity =
        !!release.lastPurchaseAt &&
        now - release.lastPurchaseAt < RECENT_PURCHASE_WINDOW_MS;

      for (const tag of release.hashtags) {
        const normalized = tag.toLowerCase().replace(/^#+/, "").trim();
        if (!normalized) continue;
        const current = scores.get(normalized) ?? 0;
        scores.set(normalized, current + 1 + (hasRecentActivity ? 2 : 0));
      }
    }

    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N)
      .map(([tag, score]) => ({
        tag: `#${tag}`,
        hot: score >= HOT_THRESHOLD,
      }));
  }, [releases]);
}
