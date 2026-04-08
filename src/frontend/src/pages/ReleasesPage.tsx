import { Heart, LineChart, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BondingCurveModule } from "../components/BondingCurveModule";
import { ClipChartModal } from "../components/ClipChartModal";
import { usePackStyle } from "../context/PackStyleContext";
import type { FeedSort, VideoClip } from "../context/VideoFeedContext";
import { useVideoFeed } from "../context/VideoFeedContext";

// ─── Creator Profile Sheet ─────────────────────────────────────────────────────

function CreatorProfile({
  clip,
  allClips,
  onClose,
}: {
  clip: VideoClip;
  allClips: VideoClip[];
  onClose: () => void;
}) {
  const creatorClips = allClips.filter(
    (c) => c.creatorName === clip.creatorName,
  );
  const totalLikes = creatorClips.reduce((s, c) => s + c.likeCount, 0);
  const initials = clip.creatorName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        flexDirection: "column",
        background: "var(--echo-bg)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 16px 12px",
          borderBottom: "1px solid var(--echo-border)",
          background: "var(--echo-surface)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          style={{
            background: "rgba(0,0,0,0.05)",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#374151",
            flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--echo-text)",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          @{clip.creatorName}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--cycle-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {initials}
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--echo-text)",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              @{clip.creatorName}
            </div>
            {clip.creatorBio && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--echo-text-secondary)",
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                {clip.creatorBio}
              </div>
            )}
            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 20,
                justifyContent: "center",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--echo-text)",
                  }}
                >
                  {creatorClips.length}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--echo-text-muted)",
                    marginTop: 2,
                  }}
                >
                  clips
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--echo-text)",
                  }}
                >
                  {totalLikes.toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--echo-text-muted)",
                    marginTop: 2,
                  }}
                >
                  likes
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 4,
          }}
        >
          {creatorClips.map((c) => (
            <div
              key={c.id}
              style={{
                aspectRatio: "9/16",
                borderRadius: 8,
                overflow: "hidden",
                background: "#e8f0fa",
                position: "relative",
              }}
            >
              <video
                src={c.videoUrl}
                muted
                loop
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 4,
                  left: 4,
                  background: "rgba(0,0,0,0.55)",
                  borderRadius: 4,
                  padding: "2px 5px",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Heart size={9} color="#fff" fill="#fff" />
                <span style={{ fontSize: 9, color: "#fff", fontWeight: 600 }}>
                  {c.likeCount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Video Card ────────────────────────────────────────────────────────────────

function VideoCard({
  clip,
  isActive,
  onCreatorTap,
  onChartTap,
}: {
  clip: VideoClip;
  isActive: boolean;
  onCreatorTap: () => void;
  onChartTap: () => void;
}) {
  const { likedIds, toggleLike } = useVideoFeed();
  const { activeStyle } = usePackStyle();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [likeAnim, setLikeAnim] = useState(false);
  const isLiked = likedIds.has(clip.id);

  const accentR = activeStyle.accentR;
  const accentG = activeStyle.accentG;
  const accentB = activeStyle.accentB;
  const accentSolid = `rgb(${accentR},${accentG},${accentB})`;
  const accentGlow = `rgba(${accentR},${accentG},${accentB},0.30)`;

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isActive) {
      vid.currentTime = 0;
      const doPlay = () => {
        vid.play().catch((err) => {
          console.warn("[VideoCard] play() failed:", err);
        });
      };
      // If already ready to play, go immediately; otherwise wait for canplay
      if (vid.readyState >= 3) {
        doPlay();
      } else {
        vid.addEventListener("canplay", doPlay, { once: true });
        return () => vid.removeEventListener("canplay", doPlay);
      }
    } else {
      vid.pause();
    }
  }, [isActive]);

  useEffect(() => {
    const vid = videoRef.current;
    if (vid) vid.muted = muted;
  }, [muted]);

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    toggleLike(clip.id);
    if (!isLiked) {
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 600);
    }
  }

  const initials = clip.creatorName.slice(0, 2).toUpperCase();

  return (
    <div
      data-ocid="releases.feed.card"
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 20,
        overflow: "hidden",
        background: "#0d1520",
        boxShadow: `0 0 20px ${accentGlow}, 0 4px 20px rgba(0,0,0,0.12)`,
        border: `1px solid rgba(${accentR},${accentG},${accentB},0.18)`,
        flexShrink: 0,
        aspectRatio: "9/16",
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={clip.videoUrl}
        loop
        muted={muted}
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        onError={(e) => {
          console.error("[VideoCard] video load error:", clip.videoUrl, e);
        }}
        onClick={() => setMuted((m) => !m)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setMuted((m) => !m);
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          cursor: "pointer",
        }}
      />

      {/* Explicit blur overlay */}
      {clip.explicitFlag && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.04em",
              background: "rgba(0,0,0,0.6)",
              borderRadius: 20,
              padding: "6px 14px",
            }}
          >
            Sensitive Content
          </span>
        </div>
      )}

      {/* Bottom gradient */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top-right controls row: mute + chart */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "auto",
        }}
      >
        {/* Mute toggle */}
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          style={{
            background: "rgba(0,0,0,0.40)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {muted ? (
            <VolumeX size={14} color="rgba(255,255,255,0.75)" />
          ) : (
            <Volume2 size={14} color="rgba(255,255,255,0.9)" />
          )}
        </button>

        {/* Chart icon */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChartTap();
          }}
          aria-label="View price chart"
          data-ocid="releases.feed.chart_button"
          style={{
            background: `rgba(${accentR},${accentG},${accentB},0.55)`,
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            border: `1px solid rgba(${accentR},${accentG},${accentB},0.4)`,
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <LineChart size={14} color="#fff" />
        </button>
      </div>

      {/* Bottom overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 14px 16px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {/* Left: avatar + name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            flex: 1,
            minWidth: 0,
            pointerEvents: "auto",
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCreatorTap();
            }}
            aria-label={`View ${clip.creatorName}'s profile`}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: accentSolid,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              border: "2px solid rgba(255,255,255,0.35)",
              flexShrink: 0,
              cursor: "pointer",
              padding: 0,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {initials}
          </button>
          <div style={{ minWidth: 0 }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCreatorTap();
              }}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  fontFamily: "DM Sans, sans-serif",
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                @{clip.creatorName}
              </div>
            </button>
            {clip.title && (
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "DM Sans, sans-serif",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginTop: 2,
                  textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                }}
              >
                {clip.title}
              </div>
            )}
          </div>
        </div>

        {/* Right: like */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            flexShrink: 0,
            pointerEvents: "auto",
          }}
        >
          <button
            type="button"
            data-ocid="releases.feed.like_button"
            onClick={handleLike}
            aria-label={isLiked ? "Unlike" : "Like"}
            style={{
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transform: likeAnim ? "scale(1.35)" : "scale(1)",
              transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <Heart
              size={20}
              color={isLiked ? "#ff6b8a" : "rgba(255,255,255,0.9)"}
              fill={isLiked ? "#ff6b8a" : "transparent"}
            />
          </button>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
              fontFamily: "DM Sans, sans-serif",
              textShadow: "0 1px 3px rgba(0,0,0,0.5)",
              lineHeight: 1,
            }}
          >
            {clip.likeCount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Row ────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { id: FeedSort; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "trending", label: "Trending" },
  { id: "top", label: "Top" },
];

const HOT_HASHTAGS = new Set([
  "#goldenhour",
  "#citylights",
  "#coastaldrift",
  "#nightdrive",
]);

function FilterRow() {
  const {
    activeSort,
    setActiveSort,
    activeHashtag,
    setActiveHashtag,
    trendingHashtags,
  } = useVideoFeed();
  const { activeStyle } = usePackStyle();
  const accentR = activeStyle.accentR;
  const accentG = activeStyle.accentG;
  const accentB = activeStyle.accentB;
  const accentSolid = `rgb(${accentR},${accentG},${accentB})`;
  const accentBg = `rgba(${accentR},${accentG},${accentB},0.12)`;

  return (
    <div
      style={{
        background: "var(--echo-surface)",
        borderBottom: "1px solid var(--echo-border)",
        paddingTop: 10,
        paddingBottom: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          paddingLeft: 16,
          paddingRight: 16,
          marginBottom: 10,
        }}
      >
        {SORT_OPTIONS.map(({ id, label }) => {
          const isActive = activeSort === id;
          return (
            <button
              type="button"
              key={id}
              data-ocid={`releases.filter.${id}`}
              onClick={() => setActiveSort(id)}
              style={{
                padding: "7px 16px",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "DM Sans, sans-serif",
                cursor: "pointer",
                transition: "all 0.15s ease",
                border: isActive ? "none" : "1.5px solid var(--echo-border)",
                background: isActive ? accentSolid : "transparent",
                color: isActive ? "#fff" : "var(--echo-text-muted)",
                letterSpacing: "0.01em",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        {trendingHashtags.map((tag) => {
          const isActiveTag = activeHashtag === tag;
          const isHot = HOT_HASHTAGS.has(tag);
          return (
            <button
              type="button"
              key={tag}
              data-ocid="releases.hashtag.chip"
              onClick={() => setActiveHashtag(isActiveTag ? null : tag)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "DM Sans, sans-serif",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "all 0.15s ease",
                border: isActiveTag
                  ? `1.5px solid ${accentSolid}`
                  : "1.5px solid var(--echo-border)",
                background: isActiveTag ? accentBg : "transparent",
                color: isActiveTag ? accentSolid : "var(--echo-text-secondary)",
              }}
            >
              {tag}
              {isHot && " 🔥"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── ReleasesPage ──────────────────────────────────────────────────────────────

export function ReleasesPage() {
  const { filteredClips, clips, isLoading } = useVideoFeed();
  const feedRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [profileClip, setProfileClip] = useState<VideoClip | null>(null);
  const [chartClip, setChartClip] = useState<VideoClip | null>(null);

  // Inject spin keyframe once
  useEffect(() => {
    const id = "releases-spin-style";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent =
      "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";
    document.head.appendChild(s);
  }, []);

  const handleCreatorTap = useCallback((clip: VideoClip) => {
    setProfileClip(clip);
  }, []);

  const handleChartTap = useCallback((clip: VideoClip) => {
    setChartClip(clip);
  }, []);

  // IntersectionObserver — detect which card is centered.
  // Re-run after each render so newly added cards are always observed.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — re-observe after every clip list change
  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    // Small rAF delay so React has flushed the new DOM nodes
    const raf = requestAnimationFrame(() => {
      const cards = container.querySelectorAll("[data-feed-card]");
      if (!cards.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const idx = Number(
                (entry.target as HTMLElement).dataset.feedCard,
              );
              if (!Number.isNaN(idx)) setActiveIndex(idx);
            }
          }
        },
        { root: container, threshold: 0.55 },
      );

      for (const card of cards) observer.observe(card);
      type WithObserver = HTMLDivElement & { _obs?: IntersectionObserver };
      (container as WithObserver)._obs?.disconnect();
      (container as WithObserver)._obs = observer;
    });

    return () => {
      cancelAnimationFrame(raf);
      type WithObserver = HTMLDivElement & { _obs?: IntersectionObserver };
      (feedRef.current as WithObserver | null)?._obs?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredClips]);

  if (profileClip) {
    return (
      <CreatorProfile
        clip={profileClip}
        allClips={clips}
        onClose={() => setProfileClip(null)}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--echo-bg)",
        overflow: "hidden",
      }}
    >
      {/* Sticky filter row */}
      <FilterRow />

      {/* Snap-scroll feed */}
      <div
        ref={feedRef}
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 14,
              padding: 24,
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              style={{
                animation: "spin 0.9s linear infinite",
              }}
              aria-hidden="true"
            >
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="var(--echo-border)"
                strokeWidth="3"
              />
              <path
                d="M20 4a16 16 0 0 1 16 16"
                stroke="var(--cycle-accent)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div
              style={{
                fontSize: 14,
                color: "var(--echo-text-muted)",
                textAlign: "center",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Loading clips…
            </div>
          </div>
        ) : filteredClips.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 12,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 4 }}>🎬</div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "var(--echo-text)",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              No clips yet
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--echo-text-muted)",
                textAlign: "center",
              }}
            >
              Mint a moment to be the first in the feed!
            </div>
          </div>
        ) : (
          filteredClips.map((clip, idx) => (
            <div
              key={clip.id}
              data-feed-card={idx}
              style={{
                scrollSnapAlign: "start",
                padding: "10px 12px",
                boxSizing: "border-box",
              }}
            >
              <VideoCard
                clip={clip}
                isActive={activeIndex === idx}
                onCreatorTap={() => handleCreatorTap(clip)}
                onChartTap={() => handleChartTap(clip)}
              />
              {/* Bonding curve module below each video */}
              <BondingCurveModule clip={clip} />
            </div>
          ))
        )}

        {/* Preload next 2 videos off-screen */}
        {filteredClips.slice(activeIndex + 1, activeIndex + 3).map((clip) => (
          <link
            key={`preload-${clip.id}`}
            rel="preload"
            as="video"
            href={clip.videoUrl}
          />
        ))}
      </div>

      {/* Chart modal */}
      {chartClip && (
        <ClipChartModal clip={chartClip} onClose={() => setChartClip(null)} />
      )}
    </div>
  );
}
