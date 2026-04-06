import { useEffect, useRef, useState } from "react";
import { usePackStyle } from "../context/PackStyleContext";
import { useReleasesMarket } from "../context/ReleasesMarketContext";
import { useWeeklyRound } from "../context/WeeklyRoundContext";

type MarketRelease = {
  id: string;
  creatorName: string;
  coverImageUrl: string;
  title: string;
  likes: number;
  listedAt: number;
  status: "active" | "burned" | "sold_out";
  roundId?: number;
  isTop10?: boolean;
  isDeletedAfterRound?: boolean;
};

function PhotoCard({
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);

  const rankFontSize = rank === 1 ? 28 : isTop3 ? 22 : 18;
  const rankColor = isTop3 ? accentColor : "#8E8E93";

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
          }}
        >
          <span
            style={{
              fontSize: rankFontSize,
              fontWeight: 700,
              color: rankColor,
              fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
              lineHeight: 1,
              textShadow: "0 1px 8px rgba(0,0,0,0.18)",
            }}
          >
            #{rank}
          </span>
        </div>

        {/* Photo */}
        <div
          style={{
            width: "100%",
            aspectRatio: "4/3",
            background: "#1a1a1a",
            overflow: "hidden",
          }}
        >
          <img
            src={
              imgError
                ? "/assets/generated/minty-pack-wrapper.png"
                : release.coverImageUrl
            }
            alt={release.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            onError={() => setImgError(true)}
          />
        </div>

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
          {/* Top 10 Weekly badge */}
          {release.isTop10 && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginTop: 8,
                padding: "3px 10px",
                borderRadius: 20,
                background: "rgba(201,168,76,0.12)",
                border: "1px solid rgba(201,168,76,0.30)",
              }}
            >
              <span style={{ fontSize: 11 }}>🏆</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#C9A84C",
                  fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
                  letterSpacing: "0.04em",
                }}
              >
                Top 10 Weekly
              </span>
            </div>
          )}
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
            fontWeight: 700,
            color: rankColor,
            fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
            lineHeight: 1,
          }}
        >
          {rank}
        </span>
      </div>

      {/* Photo thumbnail */}
      <div
        style={{
          width: 72,
          flexShrink: 0,
          aspectRatio: "4/3",
          borderRadius: 10,
          overflow: "hidden",
          background: "#1a1a1a",
        }}
      >
        <img
          src={
            imgError
              ? "/assets/generated/minty-pack-wrapper.png"
              : release.coverImageUrl
          }
          alt={release.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={() => setImgError(true)}
        />
      </div>

      {/* Title + creator + likes */}
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
            marginBottom: 3,
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
  const { roundId: currentRoundId } = useWeeklyRound();

  const accentColor = `rgb(${activeStyle.accentR},${activeStyle.accentG},${activeStyle.accentB})`;

  const rankedReleases = releases
    .filter(
      (r) =>
        !r.isDeletedAfterRound &&
        r.status !== "burned" &&
        (r.roundId === undefined || r.roundId === currentRoundId || r.isTop10),
    )
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 10);

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
          Weekly Leaderboard
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
          Top 10 most liked NFTs this round
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
          <span style={{ fontSize: 40 }}>📷</span>
          <p
            style={{
              fontSize: 15,
              color: "#8E8E93",
              margin: 0,
              fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
              lineHeight: 1.5,
            }}
          >
            No photos this week yet.
            <br />
            Post a moment on the Releases tab.
          </p>
        </div>
      ) : (
        <div data-ocid="leaderboard.list">
          {rankedReleases.map((release, idx) => (
            <PhotoCard
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
