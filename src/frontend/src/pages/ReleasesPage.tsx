import { Heart, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePackStyle } from "../context/PackStyleContext";
import { useReleasesMarket } from "../context/ReleasesMarketContext";
import type { MarketRelease } from "../context/ReleasesMarketContext";
import { useWeeklyRound } from "../context/WeeklyRoundContext";

// ── Types ─────────────────────────────────────────────────────────────────────────────────
type FeedFilter = "recent" | "trending" | "liked";

// ── FilterBar ──────────────────────────────────────────────────────────────────────────────────
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
        height: 56,
        background: "#f7f8f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "0 20px",
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
              height: 36,
              border: "none",
              borderRadius: 30,
              background: isActive ? accentColor : "transparent",
              color: isActive ? "#fff" : "#8E8E93",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
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

// ── Rank badge colors ──────────────────────────────────────────────────────────────────────
const RANK_GOLD = "#C9A84C";
const RANK_SILVER = "#A8A8A8";
const RANK_BRONZE = "#CD7F32";

function getRankColor(rank: number): string {
  if (rank === 1) return RANK_GOLD;
  if (rank === 2) return RANK_SILVER;
  if (rank === 3) return RANK_BRONZE;
  return "rgba(255,255,255,0.80)";
}

function getRankGlow(rank: number): string {
  if (rank === 1) return `0 0 12px ${RANK_GOLD}70`;
  if (rank === 2) return `0 0 12px ${RANK_SILVER}60`;
  if (rank === 3) return `0 0 12px ${RANK_BRONZE}60`;
  return "none";
}

// ── VideoFeedItem ─────────────────────────────────────────────────────────────────────────────────
interface VideoFeedItemProps {
  release: MarketRelease;
  isLiked: boolean;
  onLike: (id: string) => void;
  accentColor: string;
  isLikeRateLimited: boolean;
  likeRateLimitSecondsLeft: number;
  isNewAccount: boolean;
  canLikeResult: { allowed: boolean; reason?: string };
  /** Rank in Most Liked view (1-based). undefined when not in liked filter. */
  likedRank?: number;
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

function VideoFeedItem({
  release,
  isLiked,
  onLike,
  accentColor,
  isLikeRateLimited,
  likeRateLimitSecondsLeft,
  isNewAccount,
  canLikeResult,
  likedRank,
}: VideoFeedItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [heartAnim, setHeartAnim] = useState(false);
  const [likeCount, setLikeCount] = useState(release.likes);
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [spamBanner, setSpamBanner] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const showRankBadge = likedRank !== undefined && likedRank <= 10;
  const rankColor =
    likedRank !== undefined
      ? getRankColor(likedRank)
      : "rgba(255,255,255,0.80)";
  const rankGlow = likedRank !== undefined ? getRankGlow(likedRank) : "none";

  // Keep localLiked in sync with parent
  useEffect(() => {
    setLocalLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLikeCount(release.likes);
  }, [release.likes]);

  useEffect(() => {
    if (!spamBanner) return;
    const t = setTimeout(() => setSpamBanner(null), 3000);
    return () => clearTimeout(t);
  }, [spamBanner]);

  // Auto-play video when visible using IntersectionObserver
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleHeartTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();

      if (!canLikeResult.allowed) {
        if (canLikeResult.reason === "Account too new") {
          setSpamBanner("Your account is too new to like");
        } else if (canLikeResult.reason === "Rate limited") {
          setSpamBanner(`Too many likes. Wait ${likeRateLimitSecondsLeft}s`);
        }
        return;
      }

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
    [localLiked, onLike, release.id, canLikeResult, likeRateLimitSecondsLeft],
  );

  const handleVideoTap = useCallback((e: React.MouseEvent) => {
    // Don't toggle mute if clicking on the like button area
    const target = e.target as HTMLElement;
    if (target.closest("[data-heart-area]")) return;
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  }, []);

  const mintDateLabel = useMemo(
    () => formatMintDate(release.listedAt),
    [release.listedAt],
  );

  const heartIsDisabled = isLikeRateLimited || isNewAccount;
  const videoSrc = release.videoUrl || release.previewClipUrl;

  return (
    <div
      ref={containerRef}
      style={{
        height: "calc(100dvh - 64px - 68px - 56px)",
        scrollSnapAlign: "start",
        flexShrink: 0,
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Video card */}
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
          // Gold/silver/bronze glow border for top 3 in Most Liked
          boxShadow:
            showRankBadge && likedRank! <= 3
              ? `0 0 0 2px ${rankColor}60, 0 4px 24px ${rankColor}30`
              : undefined,
        }}
      >
        {/* Full-coverage mute toggle button (behind all controls) */}
        <button
          type="button"
          onClick={handleVideoTap}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          style={{
            position: "absolute",
            inset: 0,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            zIndex: 1,
            outline: "none",
          }}
        />
        {/* Video */}
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            loop
            muted={isMuted}
            playsInline
            poster={release.coverImageUrl || undefined}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={(e) => {
              // Fallback to poster/cover image on video load error
              const video = e.currentTarget;
              video.style.display = "none";
            }}
          />
        ) : (
          <img
            src={
              release.coverImageUrl ||
              "/assets/generated/minty-pack-wrapper.png"
            }
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
        )}

        {/* Bottom gradient */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Mute/unmute indicator — top left */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 14,
            background: "rgba(0,0,0,0.50)",
            backdropFilter: "blur(4px)",
            borderRadius: "20px",
            padding: "5px 10px",
            display: "flex",
            alignItems: "center",
            gap: 4,
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          {isMuted ? (
            <VolumeX size={14} color="rgba(255,255,255,0.8)" />
          ) : (
            <Volume2 size={14} color="rgba(255,255,255,0.9)" />
          )}
          <span
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 10,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            {isMuted ? "TAP FOR SOUND" : "SOUND ON"}
          </span>
        </div>

        {/* Rank badge — top right (Most Liked top 10 only) */}
        {showRankBadge && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              borderRadius: "20px",
              padding: "4px 12px",
              pointerEvents: "none",
              zIndex: 3,
              display: "flex",
              alignItems: "center",
              gap: 5,
              border: `1px solid ${rankColor}50`,
            }}
          >
            <span
              style={{
                color: rankColor,
                fontSize: likedRank! <= 3 ? 15 : 13,
                fontWeight: 800,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.02em",
                textShadow: rankGlow,
              }}
            >
              #{likedRank}
            </span>
            {likedRank! <= 3 && (
              <span style={{ fontSize: 12 }}>
                {likedRank === 1 ? "🥇" : likedRank === 2 ? "🥈" : "🥉"}
              </span>
            )}
          </div>
        )}

        {/* Round badge — only shown when not in liked mode (would conflict with rank badge) */}
        {!showRankBadge && release.roundId !== undefined && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              borderRadius: "20px",
              padding: "3px 10px",
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              Round #{release.roundId}
            </span>
          </div>
        )}

        {/* Spam banner */}
        {spamBanner && (
          <div
            data-ocid="releases.toast"
            style={{
              position: "absolute",
              bottom: 90,
              left: 20,
              right: 20,
              background: "rgba(220,38,38,0.90)",
              backdropFilter: "blur(8px)",
              borderRadius: 12,
              padding: "8px 14px",
              zIndex: 10,
            }}
          >
            <span
              style={{
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {spamBanner}
            </span>
          </div>
        )}

        {/* Bottom-left: creator label + mint date */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            pointerEvents: "none",
            textAlign: "left",
            maxWidth: "calc(100% - 80px)",
          }}
        >
          {release.title && (
            <div
              style={{
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                letterSpacing: "-0.01em",
                display: "block",
                marginBottom: 4,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {release.title}
            </div>
          )}
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
            }}
          >
            {mintDateLabel}
          </span>
        </div>

        {/* Bottom-right: heart + count */}
        <div
          data-heart-area="true"
          style={{ position: "relative", zIndex: 10 }}
        >
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
              cursor: heartIsDisabled ? "default" : "pointer",
              WebkitTapHighlightColor: "transparent",
              background: "transparent",
              border: "none",
              padding: 6,
              outline: "none",
              opacity: heartIsDisabled ? 0.4 : 1,
              transition: "opacity 0.2s ease",
              pointerEvents: heartIsDisabled && !isNewAccount ? "none" : "auto",
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
            {isLikeRateLimited && likeRateLimitSecondsLeft > 0 && (
              <span
                style={{
                  color: "rgba(255,100,100,0.9)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 10,
                  fontWeight: 600,
                  lineHeight: 1,
                  textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                }}
              >
                {likeRateLimitSecondsLeft}s
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ReleasesPage ────────────────────────────────────────────────────────────────────────────────────
function sortReleases(
  items: MarketRelease[],
  filter: FeedFilter,
): MarketRelease[] {
  const nowTs = Date.now();
  const ONE_HOUR = 3600000;
  const ONE_DAY = 86400000;

  if (filter === "recent") {
    return [...items].sort((a, b) => b.listedAt - a.listedAt);
  }

  if (filter === "trending") {
    let candidates = items.filter((r) => r.listedAt >= nowTs - ONE_HOUR);
    if (candidates.length < 3) {
      candidates = items.filter((r) => r.listedAt >= nowTs - ONE_DAY);
    }
    if (candidates.length < 3) {
      candidates = [...items];
    }
    return [...candidates].sort((a, b) => b.likes - a.likes);
  }

  // Most Liked
  return [...items].sort((a, b) => b.likes - a.likes);
}

export default function ReleasesPage() {
  const {
    releases,
    likedIds,
    likeRelease,
    isLikeRateLimited,
    likeRateLimitSecondsLeft,
    isNewAccount,
    canLike,
  } = useReleasesMarket();
  const { activeStyle } = usePackStyle();
  const { accentR, accentG, accentB } = activeStyle;
  const accentColor = `rgb(${accentR},${accentG},${accentB})`;
  const { roundId: currentRoundId } = useWeeklyRound();

  const [activeFilter, setActiveFilter] = useState<FeedFilter>("recent");

  const feedItems = useMemo(() => {
    const visible = releases.filter(
      (r) =>
        !r.explicit &&
        !r.isDeletedAfterRound &&
        (r.roundId === undefined ||
          r.roundId === currentRoundId ||
          r.isTop10 ||
          r.isTop25),
    );
    return sortReleases(visible, activeFilter);
  }, [releases, activeFilter, currentRoundId]);

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

      {/* Most Liked header banner */}
      {activeFilter === "liked" && feedItems.length > 0 && (
        <div
          style={{
            padding: "8px 20px 6px",
            background: "#f7f8f6",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 14 }}>🏆</span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: "#8E8E93",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Top 10 labeled with rank badges
          </span>
        </div>
      )}

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
              No moments yet
            </span>
          </div>
        ) : (
          feedItems.map((release, idx) => (
            <VideoFeedItem
              key={release.id}
              release={release}
              isLiked={likedIds.has(release.id)}
              onLike={likeRelease}
              accentColor={accentColor}
              isLikeRateLimited={isLikeRateLimited}
              likeRateLimitSecondsLeft={likeRateLimitSecondsLeft}
              isNewAccount={isNewAccount}
              canLikeResult={canLike(release.id)}
              likedRank={activeFilter === "liked" ? idx + 1 : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
