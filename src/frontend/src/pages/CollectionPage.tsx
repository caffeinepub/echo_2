import { useEffect, useRef, useState } from "react";
import { usePackStyle } from "../context/PackStyleContext";
import { useReleasesMarket } from "../context/ReleasesMarketContext";

type MarketRelease = {
  id: string;
  creatorName: string;
  previewClipUrl?: string;
  title: string;
  likes: number;
  listedAt: number;
  status: "active" | "burned" | "sold_out";
};

const SEVEN_DAYS_MS = 7 * 24 * 3600 * 1000;

function SoundOffIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="white"
      role="img"
      aria-label="Sound off"
    >
      <title>Sound off</title>
      <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.2-1.22.84v.08c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.34-1.71-.71zm4.49 11.29C13.86 17.99 12 16.5 12 14.58v-.18l3.78 3.78V17c0 .01-.01.01 0 .01z" />
    </svg>
  );
}

function SoundOnIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="white"
      role="img"
      aria-label="Sound on"
    >
      <title>Sound on</title>
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function SoundBadge({
  isMuted,
  size = 28,
}: { isMuted: boolean; size?: number }) {
  const iconSize = Math.round(size * 0.5);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        pointerEvents: "none",
      }}
    >
      {isMuted ? (
        <SoundOffIcon size={iconSize} />
      ) : (
        <SoundOnIcon size={iconSize} />
      )}
    </span>
  );
}

function VideoCard({
  release,
  isTop3,
  rank,
  accentColor,
}: {
  release: MarketRelease;
  isTop3: boolean;
  rank: number;
  accentColor: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showSoundIcon, setShowSoundIcon] = useState(false);
  const iconTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // IntersectionObserver: play only when visible
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleVideoTap = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !isMuted;
    video.muted = next;
    setIsMuted(next);
    setShowSoundIcon(true);
    if (iconTimeoutRef.current) clearTimeout(iconTimeoutRef.current);
    iconTimeoutRef.current = setTimeout(() => setShowSoundIcon(false), 1200);
  };

  const _handleVideoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleVideoTap();
    }
  };

  const rankFontSize = rank === 1 ? 28 : isTop3 ? 22 : 18;
  const rankColor = isTop3 ? accentColor : "#8E8E93";
  const rankWeight = 700;

  if (isTop3) {
    // Large card for top 3 — stacked layout
    return (
      <div
        data-ocid={`leaderboard.item.${rank}`}
        ref={containerRef}
        style={{
          background: "#FAFAF8",
          borderRadius: 20,
          boxShadow: "0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)",
          margin: "0 16px 16px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Rank badge */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 14,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: rankFontSize,
              fontWeight: rankWeight,
              color: rankColor,
              fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
              lineHeight: 1,
              textShadow: "0 1px 4px rgba(0,0,0,0.12)",
            }}
          >
            #{rank}
          </span>
        </div>

        {/* Video tap area */}
        <button
          type="button"
          aria-label={isMuted ? "Tap to unmute video" : "Tap to mute video"}
          style={{
            width: "100%",
            aspectRatio: "16/9",
            background: "#1a1a1a",
            position: "relative",
            cursor: "pointer",
            border: "none",
            padding: 0,
            display: "block",
          }}
          onClick={handleVideoTap}
        >
          {release.previewClipUrl ? (
            <video
              ref={videoRef}
              src={release.previewClipUrl}
              autoPlay
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
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#1a1a1a",
              }}
            >
              <span
                style={{
                  color: "#888",
                  fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
                  fontSize: 14,
                  textAlign: "center",
                  padding: "0 16px",
                }}
              >
                {release.title}
              </span>
            </div>
          )}

          {/* Sound icon overlay */}
          {showSoundIcon && (
            <div
              style={{
                position: "absolute",
                bottom: 10,
                right: 10,
                pointerEvents: "none",
              }}
            >
              <SoundBadge isMuted={isMuted} size={28} />
            </div>
          )}
        </button>

        {/* Info */}
        <div style={{ padding: "12px 14px 14px" }}>
          <div
            style={{
              fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: "#1a1a1a",
              marginBottom: 4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {release.title}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
                fontSize: 13,
                color: "#8E8E93",
              }}
            >
              @{release.creatorName}
            </span>
            <span
              style={{
                fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
                fontSize: 14,
                color: "#8E8E93",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ color: accentColor, fontSize: 14 }}>♥</span>
              {release.likes.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Compact horizontal card for ranks 4–25
  return (
    <div
      data-ocid={`leaderboard.item.${rank}`}
      ref={containerRef}
      style={{
        background: "#FAFAF8",
        borderRadius: 16,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        margin: "0 16px 10px",
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Rank number */}
      <div
        style={{
          width: 36,
          flexShrink: 0,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: rankFontSize,
            fontWeight: rankWeight,
            color: rankColor,
            fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
            lineHeight: 1,
          }}
        >
          {rank}
        </span>
      </div>

      {/* Video tap area */}
      <button
        type="button"
        aria-label={isMuted ? "Tap to unmute video" : "Tap to mute video"}
        style={{
          width: 100,
          flexShrink: 0,
          aspectRatio: "16/9",
          borderRadius: 10,
          overflow: "hidden",
          background: "#1a1a1a",
          cursor: "pointer",
          position: "relative",
          border: "none",
          padding: 0,
        }}
        onClick={handleVideoTap}
      >
        {release.previewClipUrl ? (
          <video
            ref={videoRef}
            src={release.previewClipUrl}
            autoPlay
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
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#2a2a2a",
            }}
          >
            <span
              style={{
                color: "#666",
                fontSize: 10,
                textAlign: "center",
                padding: "0 4px",
              }}
            >
              {release.title}
            </span>
          </div>
        )}
        {showSoundIcon && (
          <div
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              pointerEvents: "none",
            }}
          >
            <SoundBadge isMuted={isMuted} size={18} />
          </div>
        )}
      </button>

      {/* Title + likes */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: "#1a1a1a",
            marginBottom: 3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {release.title}
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
            fontSize: 12,
            color: "#8E8E93",
            marginBottom: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          @{release.creatorName}
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
            fontSize: 13,
            color: "#8E8E93",
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <span style={{ color: accentColor, fontSize: 12 }}>♥</span>
          {release.likes.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export function CollectionPage({
  onGoToLibrary: _onGoToLibrary,
}: { onGoToLibrary?: () => void }) {
  const { releases } = useReleasesMarket();
  const { activeStyle } = usePackStyle();

  const accentColor = `rgb(${activeStyle.accentR},${activeStyle.accentG},${activeStyle.accentB})`;

  const now = Date.now();
  const rankedReleases = releases
    .filter((r) => r.listedAt >= now - SEVEN_DAYS_MS && r.status !== "burned")
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 25);

  return (
    <div
      data-ocid="leaderboard.page"
      style={{
        minHeight: "100%",
        background: "#F7F7F5",
        paddingBottom: 24,
        fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div
        data-ocid="leaderboard.section"
        style={{
          padding: "24px 20px 20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: accentColor,
            margin: 0,
            marginBottom: 6,
            fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          Top 25 This Week
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#8E8E93",
            margin: 0,
            fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
            fontWeight: 400,
          }}
        >
          Most liked 7 sec clips in the last 7 days
        </p>
      </div>

      {/* Leaderboard List */}
      {rankedReleases.length === 0 ? (
        <div
          data-ocid="leaderboard.empty_state"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 32px",
            textAlign: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 40 }}>🎬</span>
          <p
            style={{
              fontSize: 15,
              color: "#8E8E93",
              margin: 0,
              fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
              lineHeight: 1.5,
            }}
          >
            No clips this week yet.
            <br />
            Post a moment on the Releases tab.
          </p>
        </div>
      ) : (
        <div data-ocid="leaderboard.list">
          {rankedReleases.map((release, idx) => (
            <VideoCard
              key={release.id}
              rank={idx + 1}
              release={release}
              isTop3={idx < 3}
              accentColor={accentColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
