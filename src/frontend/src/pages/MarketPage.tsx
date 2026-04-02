import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTheme } from "../ThemeContext";
import type { CompletedSale } from "../store/mockSales";
import { getTopSoldItems } from "../store/mockSales";

// ─── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 24) return `sold ${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `sold ${diffD}d ago`;
  const diffW = Math.floor(diffD / 7);
  if (diffW < 5) return `sold ${diffW}w ago`;
  const diffMo = Math.floor(diffD / 30);
  if (diffMo < 12) return `sold ${diffMo}mo ago`;
  const diffYr = Math.floor(diffMo / 12);
  return `sold ${diffYr}yr ago`;
}

function formatUsd(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
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

// ─── Rank Row ────────────────────────────────────────────────────────────────────

const RANK_COLORS = ["#f59e0b", "#94a3b8", "#b45309"];

function RankRow({
  sale,
  rank,
  isDark,
}: {
  sale: CompletedSale;
  rank: number;
  isDark: boolean;
}) {
  const isTop3 = rank <= 3;
  const rankColor = isTop3
    ? RANK_COLORS[rank - 1]
    : isDark
      ? "rgba(150, 210, 185, 0.5)"
      : "#10b981";

  const rowStyle = isDark
    ? {
        background: "rgba(10, 28, 20, 0.72)",
        border: isTop3
          ? "1px solid rgba(110, 230, 185, 0.25)"
          : "1px solid rgba(110, 230, 185, 0.12)",
        boxShadow: isTop3
          ? "0 2px 12px rgba(80,200,150,0.12), inset 0 1px 0 rgba(110,230,185,0.07)"
          : "0 1px 4px rgba(0,0,0,0.15)",
      }
    : {
        background: "white",
        border: isTop3
          ? "1px solid rgba(16,185,129,0.25)"
          : "1px solid oklch(0.92 0.004 185)",
        boxShadow: isTop3
          ? "0 2px 12px rgba(16,185,129,0.08)"
          : "0 1px 4px rgba(0,0,0,0.05)",
      };

  const textPrimary = isDark ? "rgba(220, 248, 235, 0.9)" : "#1a1a1a";
  const textSecondary = isDark ? "rgba(150, 210, 185, 0.55)" : "#9ca3af";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: rank * 0.04 }}
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
      style={rowStyle}
      data-ocid={`discover.item.${rank}`}
    >
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
        #{rank}
      </span>

      {/* Thumbnail */}
      <div
        className="rounded-lg overflow-hidden shrink-0"
        style={{
          width: "40px",
          height: "40px",
          border: isTop3
            ? `1.5px solid ${rankColor}`
            : isDark
              ? "1px solid rgba(110,230,185,0.18)"
              : "1px solid #e5e7eb",
          background: isDark ? "rgba(20,50,35,0.4)" : "#f3f4f6",
        }}
      >
        {sale.imageUrl ? (
          <img
            src={sale.imageUrl}
            alt={sale.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: isDark ? "rgba(20,50,35,0.6)" : "#eef0f2" }}
          >
            <span style={{ fontSize: "8px", color: textSecondary }}>IMG</span>
          </div>
        )}
      </div>

      {/* Item info */}
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold truncate"
          style={{ fontSize: "13px", color: textPrimary, lineHeight: 1.3 }}
        >
          {sale.title}
        </p>
        <p
          className="truncate"
          style={{ fontSize: "11px", color: textSecondary, lineHeight: 1.3 }}
        >
          {sale.category}
        </p>
      </div>

      {/* Price + time */}
      <div className="shrink-0 text-right">
        <p
          className="font-semibold tabular-nums"
          style={{ fontSize: "13px", color: "#10b981", lineHeight: 1.3 }}
        >
          {formatUsd(sale.priceUsd)}
        </p>
        <p style={{ fontSize: "11px", color: textSecondary, lineHeight: 1.3 }}>
          {timeAgo(sale.soldAt)}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Time Filter Pills ────────────────────────────────────────────────────────────

type TimeRange = "24H" | "1W" | "1M" | "1Y" | "ALL";
const TIME_RANGES: TimeRange[] = ["24H", "1W", "1M", "1Y", "ALL"];

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
      className="flex gap-2 mt-5 mb-4"
      style={{
        overflowX: "auto",
        paddingBottom: "4px",
        scrollbarWidth: "none",
      }}
    >
      {TIME_RANGES.map((t) => {
        const isActive = active === t;
        return (
          <button
            key={t}
            type="button"
            data-ocid={`discover.${t.toLowerCase()}.tab`}
            onClick={() => onChange(t)}
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
            {t}
          </button>
        );
      })}
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
  const [timeRange, setTimeRange] = useState<TimeRange>("ALL");

  const rankings = getTopSoldItems(timeRange);

  const textSecondary = isDark ? "rgba(150, 210, 185, 0.55)" : "#9ca3af";

  return (
    <div className="px-4 md:px-6 pt-6 pb-32 max-w-2xl mx-auto">
      {/* ── Signal cards ── */}
      <div className="grid grid-cols-2 gap-2.5 mb-2">
        <SignalCard
          label="Total Volume (All Time)"
          plainValue="$2,847,320"
          index={0}
          isDark={isDark}
        />
        <SignalCard
          label="24H Volume"
          plainValue="$48,210"
          index={1}
          isDark={isDark}
        />
        <SignalCard
          label="Total Transactions"
          plainValue="14,203"
          index={2}
          isDark={isDark}
        />
        <SignalCard
          label="Live Users"
          plainValue="1,284"
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

      {/* ── TOP SOLD header ── */}
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-[9px] uppercase tracking-[0.16em] font-medium"
          style={{ color: "var(--echo-text-secondary)" }}
        >
          Top Sold
        </p>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            color: "#10b981",
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
            }}
          />
          Updating Live
        </span>
      </div>

      {/* ── Rank list ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={timeRange}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
        >
          {rankings.length === 0 ? (
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
                No sales in this period
              </p>
              <p style={{ color: textSecondary, fontSize: "12px" }}>
                Try a broader time range to see top sold items.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {rankings.map((sale, i) => (
                <RankRow
                  key={sale.id}
                  sale={sale}
                  rank={i + 1}
                  isDark={isDark}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
