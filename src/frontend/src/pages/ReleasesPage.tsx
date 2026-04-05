import { Heart, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePackStyle } from "../context/PackStyleContext";
import { useReleasesMarket } from "../context/ReleasesMarketContext";
import type { MarketRelease } from "../context/ReleasesMarketContext";

// ─── VideoFeedItem ───────────────────────────────────────────────────────────

interface VideoFeedItemProps {
  release: MarketRelease;
  isLiked: boolean;
  onLike: (id: string) => void;
  accentColor: string;
  nextVideoRef?: React.RefObject<HTMLVideoElement | null>;
}

function VideoFeedItem({
  release,
  isLiked,
  onLike,
  accentColor,
  nextVideoRef,
}: VideoFeedItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [soundOn, setSoundOn] = useState(false);
  const [showSoundIcon, setShowSoundIcon] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [likeCount, setLikeCount] = useState(release.likes);
  const [localLiked, setLocalLiked] = useState(isLiked);

  const soundIconTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // IntersectionObserver: play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          // Preload next video for smooth scroll
          if (nextVideoRef?.current) {
            nextVideoRef.current.preload = "auto";
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [nextVideoRef]);

  // Keep localLiked in sync with parent
  useEffect(() => {
    setLocalLiked(isLiked);
  }, [isLiked]);

  const handleVideoTap = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nowMuted = !video.muted;
    video.muted = nowMuted;
    setSoundOn(!nowMuted);

    // Show transient icon
    setShowSoundIcon(true);
    if (soundIconTimer.current) clearTimeout(soundIconTimer.current);
    soundIconTimer.current = setTimeout(() => {
      setShowSoundIcon(false);
    }, 1500);
  }, []);

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

  const hasVideo = Boolean(release.previewClipUrl);

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
      {/* Full-height video card as a button for accessibility */}
      <button
        type="button"
        onClick={handleVideoTap}
        aria-label="Toggle sound"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 20,
          overflow: "hidden",
          background: "#000",
          cursor: "pointer",
          userSelect: "none",
          WebkitUserSelect: "none",
          border: "none",
          padding: 0,
          margin: 0,
          display: "block",
          outline: "none",
        }}
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            src={release.previewClipUrl}
            poster={release.coverImageUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${release.coverImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
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
            height: 160,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Bottom-left: creator name */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            pointerEvents: "none",
            textAlign: "left",
          }}
        >
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

        {/* Bottom-right: heart + count — inner button stops propagation */}
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

        {/* Transient sound icon */}
        {showSoundIcon && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0,0,0,0.45)",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              animation: "fadeInOut 1.5s ease forwards",
            }}
          >
            {soundOn ? (
              <Volume2 size={22} color="#fff" />
            ) : (
              <VolumeX size={22} color="#fff" />
            )}
          </div>
        )}
      </button>
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

  // Build refs array for preloading next video
  const videoRefs = useRef<Array<React.RefObject<HTMLVideoElement | null>>>([]);
  if (videoRefs.current.length !== feedItems.length) {
    videoRefs.current = feedItems.map(
      (_, i) => videoRefs.current[i] || { current: null },
    );
  }

  return (
    <>
      {/* Inline keyframes for sound icon fade */}
      <style>{`
        @keyframes fadeInOut {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          15%  { opacity: 1; transform: translate(-50%, -50%) scale(1);   }
          70%  { opacity: 1; transform: translate(-50%, -50%) scale(1);   }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
      `}</style>

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
              No videos yet
            </span>
          </div>
        ) : (
          feedItems.map((release, index) => (
            <VideoFeedItem
              key={release.id}
              release={release}
              isLiked={likedIds.has(release.id)}
              onLike={likeRelease}
              accentColor={accentColor}
              nextVideoRef={videoRefs.current[index + 1]}
            />
          ))
        )}
      </div>
    </>
  );
}
