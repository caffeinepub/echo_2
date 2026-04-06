import { useEffect, useRef, useState } from "react";
import { usePackStyle } from "../context/PackStyleContext";
import { useReleasesMarket } from "../context/ReleasesMarketContext";
import type { MarketRelease } from "../context/ReleasesMarketContext";
import { useWeeklyRound } from "../context/WeeklyRoundContext";

// Rank badge glow colors
const RANK_GOLD = "#C9A84C";
const RANK_SILVER = "#A8A8A8";
const RANK_BRONZE = "#CD7F32";

function getRankStyle(rank: number): {
  color: string;
  glow: string;
  bg: string;
  border: string;
} {
  if (rank === 1) {
    return {
      color: RANK_GOLD,
      glow: "0 0 14px rgba(201,168,76,0.55)",
      bg: "rgba(201,168,76,0.10)",
      border: "rgba(201,168,76,0.35)",
    };
  }
  if (rank === 2) {
    return {
      color: RANK_SILVER,
      glow: "0 0 14px rgba(168,168,168,0.45)",
      bg: "rgba(168,168,168,0.08)",
      border: "rgba(168,168,168,0.30)",
    };
  }
  if (rank === 3) {
    return {
      color: RANK_BRONZE,
      glow: "0 0 14px rgba(205,127,50,0.45)",
      bg: "rgba(205,127,50,0.08)",
      border: "rgba(205,127,50,0.28)",
    };
  }
  return {
    color: "#8E8E93",
    glow: "none",
    bg: "rgba(0,0,0,0.02)",
    border: "rgba(0,0,0,0.06)",
  };
}

// ── Large Card (Top 3) ────────────────────────────────────────────────────────
function TopThreeCard({
  release,
  rank,
  accentColor,
  score,
}: {
  release: MarketRelease;
  rank: number;
  accentColor: string;
  score: number;
}) {
  const [imgError, setImgError] = useState(false);
  const { color, glow, bg, border } = getRankStyle(rank);
  const rankSize = rank === 1 ? 36 : 28;

  return (
    <div
      data-ocid={`leaderboard.item.${rank}`}
      style={{
        margin: "0 16px 20px",
        borderRadius: 24,
        overflow: "hidden",
        background: "#FFFFFF",
        boxShadow: `0 2px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05), ${glow}`,
        border: `1.5px solid ${border}`,
        position: "relative",
        transition: "box-shadow 0.2s ease",
      }}
    >
      {/* Image */}
      <div
        style={{
          width: "100%",
          aspectRatio: "4/3",
          background: "#0a0a0a",
          overflow: "hidden",
          position: "relative",
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

        {/* Rank badge on image */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 14,
            background: bg,
            backdropFilter: "blur(8px)",
            border: `1.5px solid ${border}`,
            borderRadius: 12,
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: rankSize,
              fontWeight: 800,
              color,
              fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
              lineHeight: 1,
              textShadow: rank <= 3 ? `0 2px 10px ${color}60` : "none",
            }}
          >
            #{rank}
          </span>
        </div>

        {/* Gradient overlay at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div
          style={{
            fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
            fontSize: 17,
            fontWeight: 700,
            color: "#1a1a1a",
            marginBottom: 6,
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
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
              fontSize: 13,
              color: "#8E8E93",
              fontWeight: 500,
            }}
          >
            @{release.creatorName}
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
              fontSize: 15,
              color: "#1a1a1a",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span style={{ color: accentColor, fontSize: 15 }}>♥</span>
            {release.likes.toLocaleString()}
          </span>
        </div>

        {/* Viral score + badges row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "#B0B0B8",
              fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
              fontWeight: 400,
            }}
          >
            score: {Math.round(score).toLocaleString()}
          </span>

          {release.hadNumberOne && (
            <span
              style={{
                fontSize: 11,
                background: "rgba(201,168,76,0.10)",
                border: "1px solid rgba(201,168,76,0.30)",
                borderRadius: 20,
                padding: "2px 8px",
                color: RANK_GOLD,
                fontWeight: 600,
                fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
              }}
            >
              &#x1F451; Was #1
            </span>
          )}

          {(release.isTop25 || release.isTop10) && (
            <span
              style={{
                fontSize: 11,
                background: "rgba(201,168,76,0.08)",
                border: "1px solid rgba(201,168,76,0.25)",
                borderRadius: 20,
                padding: "2px 8px",
                color: RANK_GOLD,
                fontWeight: 600,
                fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
                letterSpacing: "0.02em",
              }}
            >
              &#x1F3C6; Top 25 Weekly
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Compact Row (Ranks 4–25) ───────────────────────────────────────────────
function LeaderboardRow({
  release,
  rank,
  accentColor,
  score,
}: {
  release: MarketRelease;
  rank: number;
  accentColor: string;
  score: number;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      data-ocid={`leaderboard.item.${rank}`}
      style={{
        margin: "0 16px 8px",
        padding: "10px 14px",
        background: "#FFFFFF",
        borderRadius: 16,
        boxShadow: "0 1px 6px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Rank number */}
      <div
        style={{
          width: 32,
          flexShrink: 0,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#C0C0C8",
            fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
          }}
        >
          {rank}
        </span>
      </div>

      {/* Thumbnail */}
      <div
        style={{
          width: 72,
          flexShrink: 0,
          aspectRatio: "4/3",
          borderRadius: 10,
          overflow: "hidden",
          background: "#111",
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

      {/* Text info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: "#1a1a1a",
            marginBottom: 2,
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
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
              fontSize: 13,
              color: "#1a1a1a",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span style={{ color: accentColor, fontSize: 12 }}>♥</span>
            {release.likes.toLocaleString()}
          </span>
          <span
            style={{
              fontSize: 11,
              color: "#C8C8D0",
              fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
            }}
          >
            {Math.round(score).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Crown/badge if applicable */}
      {(release.hadNumberOne || release.isTop25 || release.isTop10) && (
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          {release.hadNumberOne && (
            <span style={{ fontSize: 14 }}>&#x1F451;</span>
          )}
          {(release.isTop25 || release.isTop10) && (
            <span style={{ fontSize: 14 }}>&#x1F3C6;</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Live Indicator ────────────────────────────────────────────────────────────
function LiveIndicator({ accentColor }: { accentColor: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(4px)",
        borderRadius: 20,
        padding: "3px 10px",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: accentColor,
          display: "block",
          animation: "livePulse 1.8s ease-in-out infinite",
        }}
      />
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#555",
          fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        Live
      </span>
    </div>
  );
}

// ── CollectionPage ────────────────────────────────────────────────────────────
export function CollectionPage({
  onGoToLibrary: _onGoToLibrary,
}: { onGoToLibrary?: () => void }) {
  const { releases, viralScore } = useReleasesMarket();
  const { activeStyle } = usePackStyle();
  const { roundId: currentRoundId } = useWeeklyRound();

  const accentColor = `rgb(${activeStyle.accentR},${activeStyle.accentG},${activeStyle.accentB})`;
  const accentRgb = `${activeStyle.accentR},${activeStyle.accentG},${activeStyle.accentB}`;

  // Inject keyframes
  const keyframesInjected = useRef(false);
  if (!keyframesInjected.current) {
    keyframesInjected.current = true;
    if (typeof document !== "undefined") {
      const id = "leaderboard-keyframes";
      if (!document.getElementById(id)) {
        const style = document.createElement("style");
        style.id = id;
        style.textContent = `
          @keyframes livePulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }

  // Sort by viral score, top 25, non-deleted, from current round or survivors
  const rankedReleases = releases
    .filter(
      (r) =>
        !r.isDeletedAfterRound &&
        r.status !== "burned" &&
        (r.roundId === undefined ||
          r.roundId === currentRoundId ||
          r.isTop10 ||
          r.isTop25),
    )
    .map((r) => ({ release: r, score: viralScore(r) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);

  const top3 = rankedReleases.slice(0, 3);
  const rest = rankedReleases.slice(3);

  return (
    <div
      data-ocid="leaderboard.page"
      style={{
        minHeight: "100%",
        background: "#F7F7F5",
        paddingBottom: 32,
        fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div
        data-ocid="leaderboard.section"
        style={{
          padding: "28px 20px 0",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        {/* Live indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <LiveIndicator accentColor={accentColor} />
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: accentColor,
            margin: "0 0 6px",
            fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          Top 25 Weekly
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#8E8E93",
            margin: "0 0 8px",
            fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
            fontWeight: 400,
            lineHeight: 1.5,
          }}
        >
          Most liked moments this round
        </p>

        {/* Rank legend */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            padding: "6px 16px",
            background: "rgba(255,255,255,0.8)",
            borderRadius: 20,
            border: "1px solid rgba(0,0,0,0.06)",
            marginTop: 4,
          }}
        >
          {[
            { rank: "#1", color: RANK_GOLD },
            { rank: "#2", color: RANK_SILVER },
            { rank: "#3", color: RANK_BRONZE },
          ].map(({ rank, color }) => (
            <span
              key={rank}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color,
                fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
                textShadow: `0 1px 6px ${color}50`,
              }}
            >
              {rank}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(to right, transparent, rgba(${accentRgb},0.18), transparent)`,
          margin: "0 16px 20px",
        }}
      />

      {/* Empty state */}
      {rankedReleases.length === 0 && (
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
          <span style={{ fontSize: 48 }}>&#x1F4F7;</span>
          <p
            style={{
              fontSize: 15,
              color: "#8E8E93",
              margin: 0,
              fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
              lineHeight: 1.6,
            }}
          >
            No moments this week yet.
            <br />
            Mint a photo to get on the leaderboard.
          </p>
        </div>
      )}

      {/* Top 3 large cards */}
      {top3.length > 0 && (
        <div data-ocid="leaderboard.list" style={{ marginBottom: 4 }}>
          {top3.map(({ release, score }, idx) => (
            <TopThreeCard
              key={release.id}
              release={release}
              rank={idx + 1}
              accentColor={accentColor}
              score={score}
            />
          ))}
        </div>
      )}

      {/* Ranks 4–25 compact rows */}
      {rest.length > 0 && (
        <div>
          {/* Section divider */}
          {top3.length > 0 && (
            <div
              style={{
                margin: "0 16px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.06)" }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: "#B0B0B8",
                  fontFamily: "'DM Sans', Inter, -apple-system, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Ranks 4–{Math.min(25, rankedReleases.length)}
              </span>
              <div
                style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.06)" }}
              />
            </div>
          )}

          {rest.map(({ release, score }, idx) => (
            <LeaderboardRow
              key={release.id}
              release={release}
              rank={idx + 4}
              accentColor={accentColor}
              score={score}
            />
          ))}
        </div>
      )}
    </div>
  );
}
