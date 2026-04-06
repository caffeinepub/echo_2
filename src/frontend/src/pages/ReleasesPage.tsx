import { Heart } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePackStyle } from "../context/PackStyleContext";
import { useReleasesMarket } from "../context/ReleasesMarketContext";
import type { MarketRelease } from "../context/ReleasesMarketContext";

// ─── PhotoFeedItem ────────────────────────────────────────────────────────────

interface PhotoFeedItemProps {
  release: MarketRelease;
  isLiked: boolean;
  onLike: (id: string) => void;
  accentColor: string;
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

  return (
    <div
      ref={containerRef}
      style={{
        height: "calc(100dvh - 64px - 68px)",
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
            height: 160,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Bottom-left: creator label */}
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
            }}
          >
            @{release.creatorName}
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
            {likeCount}
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── ReleasesPage ─────────────────────────────────────────────────────────────

export default function ReleasesPage() {
  const { releases, likedIds, likeRelease } = useReleasesMarket();
  const { activeStyle } = usePackStyle();
  const { accentR, accentG, accentB } = activeStyle;
  const accentColor = `rgb(${accentR},${accentG},${accentB})`;

  // Filter: only non-explicit releases
  const feedItems = releases.filter((r) => !r.explicit);

  return (
    <div
      data-ocid="releases.list"
      style={{
        height: "calc(100dvh - 64px - 68px)",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        WebkitOverflowScrolling:
          "touch" as React.CSSProperties["WebkitOverflowScrolling"],
        display: "flex",
        flexDirection: "column",
        background: "#f7f8f6",
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
  );
}
