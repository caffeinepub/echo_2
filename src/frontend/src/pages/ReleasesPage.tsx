import { Heart } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePackStyle } from "../context/PackStyleContext";
import { useReleasesMarket } from "../context/ReleasesMarketContext";
import type { MarketRelease } from "../context/ReleasesMarketContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type FeedFilter = "recent" | "trending" | "liked";

// ─── FilterBar ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  active: FeedFilter;
  onChange: (f: FeedFilter) => void;
  accentColor: string;
}

function FilterBar({ active, onChange, accentColor }: FilterBarProps) {
  const tabs: { id: FeedFilter; label: string }[] = [
    { id: "recent", label: "Most Recent" },
    { id: "trending", label: "Trending" },
    { id: "liked", label: "Most Liked" },
  ];

  return (
    <div
      style={{
        height: 44,
        background: "#f7f8f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "0 16px",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            data-ocid={`releases.${tab.id}.tab`}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              height: 30,
              border: "none",
              borderRadius: 30,
              background: isActive ? accentColor : "transparent",
              color: isActive ? "#fff" : "#8E8E93",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: isActive ? 600 : 500,
              letterSpacing: "0.02em",
              cursor: "pointer",
              opacity: isActive ? 1 : 0.65,
              transition:
                "background 0.2s ease, color 0.2s ease, opacity 0.2s ease",
              WebkitTapHighlightColor: "transparent",
              outline: "none",
              whiteSpace: "nowrap",
              padding: "0 8px",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── PhotoFeedItem ────────────────────────────────────────────────────────────

interface PhotoFeedItemProps {
  release: MarketRelease;
  isLiked: boolean;
  onLike: (id: string) => void;
  accentColor: string;
}

function formatMintDate(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function PhotoFeedItem({
  release,
  isLiked,
  onLike,
  accentColor,
}: PhotoFeedItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [heartAnim, setHeartAnim] = useState(false);
  const [likeCount, setLikeCount] = useState(release.likes);
  const [localLiked, setLocalLiked] = useState(isLiked);

  // Keep localLiked in sync with parent
  useEffect(() => {
    setLocalLiked(isLiked);
  }, [isLiked]);

  // Keep likeCount in sync when release.likes changes from filter switch
  useEffect(() => {
    setLikeCount(release.likes);
  }, [release.likes]);

  const handleHeartTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 300);

      if (!localLiked) {
        setLikeCount((c) => c + 1);
      } else {
        setLikeCount((c) => Math.max(0, c - 1));
      }
      setLocalLiked((prev) => !prev);
      onLike(release.id);
    },
    [localLiked, onLike, release.id],
  );

  const mintDateLabel = useMemo(
    () => formatMintDate(release.listedAt),
    [release.listedAt],
  );

  return (
    <div
      ref={containerRef}
      style={{
        height: "calc(100dvh - 64px - 68px - 44px)",
        scrollSnapAlign: "start",
        flexShrink: 0,
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Photo card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 20,
          overflow: "hidden",
          background: "#111",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* Photo */}
        <img
          src={release.coverImageUrl}
          alt={release.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "/assets/generated/minty-pack-wrapper.png";
          }}
        />

        {/* Bottom gradient */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 180,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Bottom-left: creator label + mint date */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            pointerEvents: "none",
            textAlign: "left",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 2,
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            Minted by
          </div>
          <span
            style={{
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              letterSpacing: "0.01em",
              display: "block",
            }}
          >
            @{release.creatorName}
          </span>
          {/* Mint date/time */}
          <span
            style={{
              color: "rgba(255,255,255,0.55)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 400,
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              letterSpacing: "0.01em",
              display: "block",
              marginTop: 3,
              pointerEvents: "none",
            }}
          >
            {mintDateLabel}
          </span>
        </div>

        {/* Bottom-right: heart + count */}
        <button
          type="button"
          onClick={handleHeartTap}
          aria-label={localLiked ? "Unlike" : "Like"}
          aria-pressed={localLiked}
          data-ocid="releases.toggle"
          style={{
            position: "absolute",
            bottom: 16,
            right: 18,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
            background: "transparent",
            border: "none",
            padding: 6,
            outline: "none",
          }}
        >
          <Heart
            size={26}
            fill={localLiked ? accentColor : "none"}
            color={localLiked ? accentColor : "#fff"}
            style={{
              transform: heartAnim ? "scale(1.4)" : "scale(1)",
              transition: "transform 0.15s ease",
              filter: localLiked
                ? `drop-shadow(0 0 6px ${accentColor}80)`
                : "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
            }}
          />
          <span
            style={{
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              lineHeight: 1,
            }}
          >
            {likeCount.toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── ReleasesPage ─────────────────────────────────────────────────────────────

function sortReleases(
  items: MarketRelease[],
  filter: FeedFilter,
): MarketRelease[] {
  const now = Date.now();
  const ONE_HOUR = 3600000;
  const ONE_DAY = 86400000;

  if (filter === "recent") {
    return [...items].sort((a, b) => b.listedAt - a.listedAt);
  }

  if (filter === "trending") {
    // Try last 1 hr first
    let candidates = items.filter((r) => r.listedAt >= now - ONE_HOUR);
    // Fall back to last 24 hrs if fewer than 3
    if (candidates.length < 3) {
      candidates = items.filter((r) => r.listedAt >= now - ONE_DAY);
    }
    // If still < 3, use everything
    if (candidates.length < 3) {
      candidates = [...items];
    }
    return [...candidates].sort((a, b) => b.likes - a.likes);
  }

  // Most Liked
  return [...items].sort((a, b) => b.likes - a.likes);
}

export default function ReleasesPage() {
  const { releases, likedIds, likeRelease } = useReleasesMarket();
  const { activeStyle } = usePackStyle();
  const { accentR, accentG, accentB } = activeStyle;
  const accentColor = `rgb(${accentR},${accentG},${accentB})`;

  const [activeFilter, setActiveFilter] = useState<FeedFilter>("recent");

  // Filter: only non-explicit releases, then apply sort
  const feedItems = useMemo(() => {
    const nonExplicit = releases.filter((r) => !r.explicit);
    return sortReleases(nonExplicit, activeFilter);
  }, [releases, activeFilter]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100dvh - 64px - 68px)",
        background: "#f7f8f6",
        overflow: "hidden",
      }}
    >
      {/* Sticky filter bar */}
      <FilterBar
        active={activeFilter}
        onChange={setActiveFilter}
        accentColor={accentColor}
      />

      {/* Snap-scroll feed */}
      <div
        data-ocid="releases.list"
        style={{
          flex: 1,
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling:
            "touch" as React.CSSProperties["WebkitOverflowScrolling"],
          display: "flex",
          flexDirection: "column",
          scrollbarWidth: "none" as React.CSSProperties["scrollbarWidth"],
        }}
      >
        {feedItems.length === 0 ? (
          <div
            data-ocid="releases.empty_state"
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#b0b8c1",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                fontWeight: 400,
                letterSpacing: "0.01em",
              }}
            >
              No photos yet
            </span>
          </div>
        ) : (
          feedItems.map((release) => (
            <PhotoFeedItem
              key={release.id}
              release={release}
              isLiked={likedIds.has(release.id)}
              onLike={likeRelease}
              accentColor={accentColor}
            />
          ))
        )}
      </div>
    </div>
  );
}
