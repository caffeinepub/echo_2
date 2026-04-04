import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import { useUserSettings } from "../context/UserSettingsContext";
import {
  type MintMomentSetRank,
  type TrendingHashtag,
  getDiscoverSets,
  getTrendingHashtags,
} from "../store/mockDiscoverSets";

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Signal Card ────────────────────────────────────────────────────────────────

function SignalCard({
  label,
  plainValue,
  index,
  isDark,
}: {
  label: string;
  plainValue: string;
  index: number;
  isDark: boolean;
}) {
  const cardStyle = isDark
    ? {
        background: "rgba(10, 28, 20, 0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(110, 230, 185, 0.15)",
        boxShadow:
          "0 0 20px rgba(80, 200, 150, 0.08), inset 0 1px 0 rgba(110, 230, 185, 0.07)",
      }
    : {
        background:
          "linear-gradient(135deg, rgba(200,245,230,0.5), rgba(159,232,208,0.3))",
        border: "1px solid rgba(16,185,129,0.2)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 + index * 0.07 }}
      className="rounded-2xl px-4 py-3.5 flex flex-col gap-1"
      style={cardStyle}
    >
      <p
        className="text-[9px] uppercase tracking-[0.16em] font-medium"
        style={
          isDark
            ? { color: "rgba(150, 210, 185, 0.65)" }
            : { color: "var(--echo-text-secondary)" }
        }
      >
        {label}
      </p>
      <p
        className="text-base font-mono font-semibold tabular-nums leading-tight"
        style={{ color: "#10b981" }}
      >
        {plainValue}
      </p>
    </motion.div>
  );
}

// ─── Preview Thumbnail ──────────────────────────────────────────────────────────

function PreviewThumb({
  set,
  isDark,
  isHighlight,
  highlightColor,
  size = "sm",
}: {
  set: MintMomentSetRank;
  isDark: boolean;
  isHighlight: boolean;
  highlightColor: string;
  size?: "sm" | "lg";
}) {
  const containerStyle: React.CSSProperties =
    size === "sm"
      ? {
          width: "36px",
          height: "45px",
          flexShrink: 0,
          borderRadius: "8px",
          overflow: "hidden",
          border: isHighlight
            ? `1.5px solid ${highlightColor}`
            : isDark
              ? "1px solid rgba(110,230,185,0.18)"
              : "1px solid #e5e7eb",
        }
      : {
          width: "100%",
          aspectRatio: "4/5",
          borderRadius: "12px",
          overflow: "hidden",
          maxHeight: "210px",
        };

  return (
    <div style={containerStyle}>
      {set.previewClipUrl ? (
        <video
          src={set.previewClipUrl}
          autoPlay
          muted
          loop
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <img
          src={set.coverImageUrl}
          alt={set.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
    </div>
  );
}

// ─── Set Rank Row ────────────────────────────────────────────────────────────────

const RANK_COLORS = ["#f59e0b", "#94a3b8", "#b45309"];

function SetRankRow({
  set,
  rank,
  isDark,
  onClick,
  sectionRank,
  explicitModeOn = false,
}: {
  set: MintMomentSetRank;
  rank: number;
  isDark: boolean;
  onClick: () => void;
  sectionRank: number;
  explicitModeOn?: boolean;
}) {
  const isHighlight = sectionRank <= 3;
  const rankColor = isHighlight
    ? RANK_COLORS[sectionRank - 1]
    : isDark
      ? "rgba(150, 210, 185, 0.5)"
      : "#10b981";

  const rowStyle = isDark
    ? {
        background: "rgba(10, 28, 20, 0.72)",
        border: isHighlight
          ? "1px solid rgba(110, 230, 185, 0.25)"
          : "1px solid rgba(110, 230, 185, 0.12)",
        boxShadow: isHighlight
          ? "0 2px 12px rgba(80,200,150,0.12), inset 0 1px 0 rgba(110,230,185,0.07)"
          : "0 1px 4px rgba(0,0,0,0.15)",
      }
    : {
        background: "white",
        border: isHighlight
          ? "1px solid rgba(16,185,129,0.25)"
          : "1px solid oklch(0.92 0.004 185)",
        boxShadow: isHighlight
          ? "0 2px 12px rgba(16,185,129,0.08)"
          : "0 1px 4px rgba(0,0,0,0.05)",
      };

  const textPrimary = isDark ? "rgba(220, 248, 235, 0.9)" : "#1a1a1a";
  const textSecondary = isDark ? "rgba(150, 210, 185, 0.55)" : "#9ca3af";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: Math.min(sectionRank * 0.04, 0.5) }}
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 cursor-pointer"
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      data-ocid={`discover.item.${rank}`}
      style={{
        ...rowStyle,
        position: "relative",
        filter: set.explicit && !explicitModeOn ? "blur(4px)" : "none",
        userSelect: set.explicit && !explicitModeOn ? "none" : "auto",
        transition: "filter 0.2s",
      }}
    >
      {/* Explicit overlay badge */}
      {set.explicit && !explicitModeOn && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            cursor: "default",
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              background: isDark
                ? "rgba(245,158,11,0.85)"
                : "rgba(245,158,11,0.90)",
              color: "#fff",
              borderRadius: "10px",
              padding: "2px 8px",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(245,158,11,0.40)",
            }}
          >
            EXPLICIT
          </span>
        </div>
      )}
      {/* Rank */}
      <span
        className="font-bold tabular-nums shrink-0"
        style={{
          fontSize: "13px",
          color: rankColor,
          width: "22px",
          textAlign: "center",
        }}
      >
        #{sectionRank}
      </span>

      {/* Thumbnail 4:5 portrait */}
      <PreviewThumb
        set={set}
        isDark={isDark}
        isHighlight={isHighlight}
        highlightColor={rankColor}
        size="sm"
      />

      {/* Set info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p
            className="font-semibold truncate"
            style={{ fontSize: "13px", color: textPrimary, lineHeight: 1.3 }}
          >
            {set.title}
          </p>
          {set.trendingTag && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: "8px",
                background: isDark
                  ? "rgba(245, 158, 11, 0.18)"
                  : "rgba(245, 158, 11, 0.12)",
                color: "#f59e0b",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              🔥 trending
            </span>
          )}
        </div>
        <p
          className="truncate"
          style={{ fontSize: "11px", color: textSecondary, lineHeight: 1.3 }}
        >
          by {set.creator}
        </p>
      </div>

      {/* Engagement stats */}
      <div className="shrink-0 text-right">
        <p
          className="font-semibold tabular-nums"
          style={{ fontSize: "12px", color: "#10b981", lineHeight: 1.3 }}
        >
          {formatCount(set.packOpens)} opens
        </p>
        <p
          className="tabular-nums"
          style={{ fontSize: "10px", color: textSecondary, lineHeight: 1.3 }}
        >
          {formatCount(set.uniqueCollectors)} collectors
        </p>
      </div>
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  label,
  isDark,
}: {
  icon: string;
  label: string;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mt-6 mb-2.5">
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <p
        className="text-[11px] uppercase tracking-[0.14em] font-semibold"
        style={{
          color: isDark ? "rgba(150, 210, 185, 0.75)" : "#10b981",
        }}
      >
        {label}
      </p>
      <div
        style={{
          flex: 1,
          height: "1px",
          background: isDark
            ? "rgba(110,230,185,0.1)"
            : "rgba(16,185,129,0.12)",
          marginLeft: "4px",
        }}
      />
    </div>
  );
}

// ─── Trending Hashtags Section ───────────────────────────────────────────────

function TrendingHashtagsSection({
  hashtags,
  isDark,
}: {
  hashtags: TrendingHashtag[];
  isDark: boolean;
}) {
  if (hashtags.length === 0) return null;

  return (
    <div className="mt-4 mb-2">
      <div className="flex flex-wrap gap-2">
        {hashtags.map(({ tag, hot }) => (
          <span
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              padding: "5px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.01em",
              cursor: "default",
              background: isDark
                ? "rgba(10, 32, 22, 0.65)"
                : "rgba(240, 253, 248, 0.85)",
              border: isDark
                ? "1px solid rgba(110, 230, 185, 0.14)"
                : "1px solid rgba(16, 185, 129, 0.18)",
              color: isDark
                ? "rgba(160, 220, 195, 0.85)"
                : "rgba(5, 120, 80, 0.9)",
              backdropFilter: isDark ? "blur(8px)" : "none",
              WebkitBackdropFilter: isDark ? "blur(8px)" : "none",
            }}
          >
            {tag}
            {hot ? " 🔥" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Time Filter Pills ────────────────────────────────────────────────────────

type TimeRange = "ALL_TIME" | "24H" | "7D" | "30D";
const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: "All Time", value: "ALL_TIME" },
  { label: "24H", value: "24H" },
  { label: "7D", value: "7D" },
  { label: "30D", value: "30D" },
];

function TimeFilterPills({
  active,
  onChange,
  isDark,
}: {
  active: TimeRange;
  onChange: (t: TimeRange) => void;
  isDark: boolean;
}) {
  return (
    <div
      className="flex gap-2 mt-5 mb-1"
      style={{
        overflowX: "auto",
        paddingBottom: "4px",
        scrollbarWidth: "none",
      }}
    >
      {TIME_RANGES.map((t) => {
        const isActive = active === t.value;
        return (
          <button
            key={t.value}
            type="button"
            data-ocid={`discover.${t.value.toLowerCase()}.tab`}
            onClick={() => onChange(t.value)}
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s",
              background: isActive
                ? "#10b981"
                : isDark
                  ? "rgba(20, 50, 35, 0.5)"
                  : "#f3f4f6",
              color: isActive
                ? "white"
                : isDark
                  ? "rgba(150, 210, 185, 0.65)"
                  : "#6b7280",
              border: isActive
                ? "1px solid transparent"
                : isDark
                  ? "1px solid rgba(110, 230, 185, 0.12)"
                  : "1px solid #e5e7eb",
              boxShadow: isActive ? "0 0 12px rgba(16,185,129,0.3)" : "none",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Set Detail Sheet ────────────────────────────────────────────────────────────

function SetDetailSheet({
  set,
  isDark,
  onClose,
}: {
  set: MintMomentSetRank;
  isDark: boolean;
  onClose: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const overlayBg = isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.35)";
  const sheetBg = isDark ? "#0d1f16" : "#ffffff";
  const textPrimary = isDark ? "rgba(220, 248, 235, 0.9)" : "#1a1a1a";
  const textSecondary = isDark ? "rgba(150, 210, 185, 0.55)" : "#9ca3af";
  const dividerColor = isDark ? "rgba(110,230,185,0.1)" : "#f0f0f0";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
      data-ocid="discover.modal"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        style={{
          position: "absolute",
          inset: 0,
          background: overlayBg,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          transition: "opacity 0.3s",
          opacity: visible ? 1 : 0,
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        style={{
          position: "relative",
          background: sheetBg,
          borderRadius: "24px 24px 0 0",
          maxHeight: "88vh",
          overflowY: "auto",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          boxShadow: isDark
            ? "0 -4px 40px rgba(0,0,0,0.5)"
            : "0 -4px 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* Handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "12px",
            paddingBottom: "8px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              background: isDark ? "rgba(110,230,185,0.3)" : "rgba(0,0,0,0.15)",
            }}
          />
        </div>

        {/* Close button */}
        <button
          type="button"
          data-ocid="discover.close_button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: isDark ? "rgba(110,230,185,0.1)" : "rgba(0,0,0,0.06)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: textPrimary,
            fontSize: "16px",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <div style={{ padding: "0 16px 32px" }}>
          {/* Preview clip / cover image */}
          <div
            style={{
              width: "100%",
              aspectRatio: "4/5",
              maxHeight: "210px",
              borderRadius: "16px",
              overflow: "hidden",
              marginBottom: "16px",
              background: isDark ? "rgba(20,50,35,0.6)" : "#f3f4f6",
            }}
          >
            {set.previewClipUrl ? (
              <video
                src={set.previewClipUrl}
                autoPlay
                muted
                loop
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <img
                src={set.coverImageUrl}
                alt={set.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>

          {/* Title + creator + trending */}
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: textPrimary,
                lineHeight: 1.2,
              }}
            >
              {set.title}
            </h2>
            {set.trendingTag && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: "10px",
                  background: isDark
                    ? "rgba(245, 158, 11, 0.18)"
                    : "rgba(245, 158, 11, 0.12)",
                  color: "#f59e0b",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                🔥 trending
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: "13px",
              color: textSecondary,
              marginBottom: "16px",
            }}
          >
            by {set.creator}
          </p>

          {/* Engagement stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            {[
              { label: "Opens", value: formatCount(set.packOpens) },
              { label: "Collectors", value: formatCount(set.uniqueCollectors) },
              { label: "Plays", value: formatCount(set.previewPlays) },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: isDark
                    ? "rgba(110,230,185,0.06)"
                    : "rgba(16,185,129,0.06)",
                  border: isDark
                    ? "1px solid rgba(110,230,185,0.12)"
                    : "1px solid rgba(16,185,129,0.15)",
                  borderRadius: "12px",
                  padding: "10px 8px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#10b981",
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: textSecondary,
                    marginTop: "2px",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Volume as secondary line */}
          <p
            style={{
              fontSize: "11px",
              color: textSecondary,
              marginBottom: "12px",
            }}
          >
            Volume: ${set.totalVolume.toLocaleString()} &nbsp;·&nbsp;{" "}
            {set.salesCount} sales
          </p>

          {/* Pack info */}
          <div
            style={{
              background: isDark ? "rgba(10, 28, 20, 0.6)" : "#f9fafb",
              border: isDark
                ? "1px solid rgba(110,230,185,0.12)"
                : "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "12px 14px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {[
                { label: "Total Packs", value: set.totalPacks },
                { label: "Remaining", value: set.remainingPacks },
                {
                  label: "Price/Pack",
                  value: `$${set.pricePerPack.toFixed(2)}`,
                },
              ].map((item) => (
                <div key={item.label} style={{ flex: 1, textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: textPrimary,
                    }}
                  >
                    {item.value}
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: textSecondary,
                      marginTop: "1px",
                    }}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {set.description && (
            <p
              style={{
                fontSize: "13px",
                color: textSecondary,
                lineHeight: 1.6,
                marginBottom: "14px",
              }}
            >
              {set.description}
            </p>
          )}

          {/* Recent activity */}
          {set.recentSales.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontWeight: 600,
                  color: textSecondary,
                  marginBottom: "8px",
                }}
              >
                Recent Activity
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {set.recentSales.slice(0, 5).map((sale, idx) => (
                  <div
                    key={`${sale.itemTitle}-${sale.timeAgo}-${idx}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 10px",
                      background: isDark
                        ? "rgba(110,230,185,0.04)"
                        : "rgba(0,0,0,0.02)",
                      borderRadius: "10px",
                      border: isDark
                        ? "1px solid rgba(110,230,185,0.08)"
                        : "1px solid #f0f0f0",
                    }}
                    data-ocid={`discover.activity.item.${idx + 1}`}
                  >
                    <span style={{ fontSize: "12px", color: textPrimary }}>
                      {sale.itemTitle}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: textSecondary,
                      }}
                    >
                      {sale.timeAgo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity velocity blip */}
          {set.recentActivityVelocity > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "14px",
                padding: "8px 10px",
                background: isDark
                  ? "rgba(110,230,185,0.05)"
                  : "rgba(16,185,129,0.05)",
                borderRadius: "10px",
                border: isDark
                  ? "1px solid rgba(110,230,185,0.1)"
                  : "1px solid rgba(16,185,129,0.12)",
              }}
            >
              <span
                className="animate-pulse"
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#10b981",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span
                style={{ fontSize: "11px", color: "#10b981", fontWeight: 600 }}
              >
                {set.recentActivityVelocity} events in the last 2 hours
              </span>
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: dividerColor,
              marginBottom: "16px",
            }}
          />

          {/* CTA */}
          <button
            type="button"
            data-ocid="discover.buy_packs.primary_button"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              background:
                set.remainingPacks === 0
                  ? isDark
                    ? "rgba(110,230,185,0.1)"
                    : "#f3f4f6"
                  : "linear-gradient(135deg, #10b981, #059669)",
              color: set.remainingPacks === 0 ? textSecondary : "white",
              border: "none",
              fontSize: "15px",
              fontWeight: 700,
              cursor: set.remainingPacks === 0 ? "default" : "pointer",
              boxShadow:
                set.remainingPacks === 0
                  ? "none"
                  : "0 4px 16px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
              letterSpacing: "0.01em",
            }}
            disabled={set.remainingPacks === 0}
          >
            {set.remainingPacks === 0
              ? "Sold Out"
              : `Buy Packs · $${set.pricePerPack.toFixed(2)} / pack`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────────

interface MarketPageProps {
  onAlbumClick?: (albumId: string) => void;
  onSetClick: (slug: string) => void;
}

export function MarketPage({
  onAlbumClick: _onAlbumClick,
  onSetClick: _onSetClick,
}: MarketPageProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { explicitModeOn } = useUserSettings();
  const [timeRange, setTimeRange] = useState<TimeRange>("ALL_TIME");
  const [selectedSet, setSelectedSet] = useState<MintMomentSetRank | null>(
    null,
  );

  const top100Sets = getDiscoverSets(timeRange);
  const trendingHashtags = getTrendingHashtags(timeRange);
  const textSecondary = isDark ? "rgba(150, 210, 185, 0.55)" : "#9ca3af";

  const hasAnySets = top100Sets.length > 0;

  return (
    <div className="px-4 md:px-6 pt-6 pb-32 max-w-2xl mx-auto">
      {/* ── Signal cards ── */}
      <div className="grid grid-cols-2 gap-2.5 mb-2">
        <SignalCard
          label="Total Opens"
          plainValue="842K opens"
          index={0}
          isDark={isDark}
        />
        <SignalCard
          label="Active Collectors"
          plainValue="12.4K collectors"
          index={1}
          isDark={isDark}
        />
        <SignalCard
          label="Moments Live"
          plainValue="100 moments"
          index={2}
          isDark={isDark}
        />
        <SignalCard
          label="Active Now"
          plainValue="1,284 active"
          index={3}
          isDark={isDark}
        />
      </div>

      {/* ── Time filter pills ── */}
      <TimeFilterPills
        active={timeRange}
        onChange={setTimeRange}
        isDark={isDark}
      />

      {/* ── Subtle live note ── */}
      <div className="flex items-center justify-end mt-1 mb-1">
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "10px",
            color: isDark ? "rgba(150, 210, 185, 0.45)" : "#9ca3af",
          }}
        >
          <span
            className="animate-pulse"
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "#10b981",
              display: "inline-block",
            }}
          />
          100 moments · live
        </span>
      </div>

      {/* ── Sections ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={timeRange}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
        >
          {!hasAnySets ? (
            <div
              className="flex flex-col items-center justify-center py-14 text-center"
              data-ocid="discover.rankings.empty_state"
            >
              <p
                style={{
                  color: isDark ? "rgba(220, 248, 235, 0.9)" : "#1a1a1a",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                No active moments in this period
              </p>
              <p style={{ color: textSecondary, fontSize: "12px" }}>
                Try a broader time range to see trending Mint Moment sets.
              </p>
            </div>
          ) : (
            <div>
              {/* ── Trending Hashtags ── */}
              <TrendingHashtagsSection
                hashtags={trendingHashtags}
                isDark={isDark}
              />

              {/* ── Top 100 ── */}
              <div className="mt-4">
                <SectionHeader icon="🏆" label="Top 100" isDark={isDark} />
                <div className="flex flex-col gap-2">
                  {top100Sets.map((set, i) => (
                    <SetRankRow
                      key={set.id}
                      set={set}
                      rank={i + 1}
                      sectionRank={i + 1}
                      isDark={isDark}
                      onClick={() => setSelectedSet(set)}
                      explicitModeOn={explicitModeOn}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Set Detail Sheet ── */}
      <AnimatePresence>
        {selectedSet && (
          <SetDetailSheet
            set={selectedSet}
            isDark={isDark}
            onClose={() => setSelectedSet(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
