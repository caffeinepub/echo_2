import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { usePackStyle } from "../context/PackStyleContext";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SoldNFT {
  id: string;
  title: string;
  setName: string;
  creator: string;
  imageUrl: string;
  mediaType: "photo" | "video";
  rarity: "Common" | "Rare";
  salePrice: number;
  soldAt: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatUSD(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

// ─── Mock Sold NFT Data ───────────────────────────────────────────────────────

const NOW = Date.now();
const D = 86400000;
const H = 3600000;

const SOLD_NFTS: SoldNFT[] = [
  {
    id: "sold_1",
    title: "Golden Hour #1",
    setName: "Golden Hour Set",
    creator: "light.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&q=80",
    mediaType: "video",
    rarity: "Rare",
    salePrice: 520,
    soldAt: NOW - 3 * H,
  },
  {
    id: "sold_2",
    title: "Night Drive #7",
    setName: "Night Drive Series",
    creator: "neon_rider.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=200&q=80",
    mediaType: "video",
    rarity: "Rare",
    salePrice: 410,
    soldAt: NOW - 18 * H,
  },
  {
    id: "sold_3",
    title: "Sunset Ride #3",
    setName: "Coastal Drift Vol. 1",
    creator: "mintcreator.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
    mediaType: "video",
    rarity: "Rare",
    salePrice: 380,
    soldAt: NOW - 6 * H,
  },
  {
    id: "sold_4",
    title: "Alpine Glow #2",
    setName: "Alpine Series",
    creator: "peak.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=200&q=80",
    mediaType: "photo",
    rarity: "Common",
    salePrice: 245,
    soldAt: NOW - 2 * D,
  },
  {
    id: "sold_5",
    title: "Forest Walk #12",
    setName: "Forest Walks",
    creator: "woodsy.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&q=80",
    mediaType: "photo",
    rarity: "Common",
    salePrice: 190,
    soldAt: NOW - 4 * D,
  },
  {
    id: "sold_6",
    title: "City Lights #5",
    setName: "Urban Pulse",
    creator: "citymuse.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=200&q=80",
    mediaType: "video",
    rarity: "Rare",
    salePrice: 175,
    soldAt: NOW - 1 * D,
  },
  {
    id: "sold_7",
    title: "Desert Wind #4",
    setName: "Desert Wind",
    creator: "sandstorm.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=200&q=80",
    mediaType: "photo",
    rarity: "Common",
    salePrice: 140,
    soldAt: NOW - 3 * D,
  },
  {
    id: "sold_8",
    title: "Ocean Horizon #8",
    setName: "Coastal Drift Vol. 1",
    creator: "mintcreator.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1433360405326-e50f909805b3?w=200&q=80",
    mediaType: "photo",
    rarity: "Common",
    salePrice: 120,
    soldAt: NOW - 8 * H,
  },
  {
    id: "sold_9",
    title: "Golden Hour #3",
    setName: "Golden Hour Set",
    creator: "light.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&q=80",
    mediaType: "photo",
    rarity: "Common",
    salePrice: 98,
    soldAt: NOW - 5 * D,
  },
  {
    id: "sold_10",
    title: "Summit View #1",
    setName: "Alpine Series",
    creator: "peak.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=200&q=80",
    mediaType: "video",
    rarity: "Rare",
    salePrice: 89,
    soldAt: NOW - 10 * D,
  },
  {
    id: "sold_11",
    title: "Night Drive #3",
    setName: "Night Drive Series",
    creator: "neon_rider.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=200&q=80",
    mediaType: "photo",
    rarity: "Common",
    salePrice: 75,
    soldAt: NOW - 15 * D,
  },
  {
    id: "sold_12",
    title: "River Bend #6",
    setName: "River Moments",
    creator: "flowstate.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
    mediaType: "photo",
    rarity: "Common",
    salePrice: 62,
    soldAt: NOW - 20 * D,
  },
  {
    id: "sold_13",
    title: "Coastal Sunset #9",
    setName: "Coastal Drift Vol. 2",
    creator: "mintcreator.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=200&q=80",
    mediaType: "video",
    rarity: "Rare",
    salePrice: 55,
    soldAt: NOW - 25 * D,
  },
  {
    id: "sold_14",
    title: "Mountain Mist #2",
    setName: "Alpine Series",
    creator: "peak.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&q=80",
    mediaType: "photo",
    rarity: "Common",
    salePrice: 48,
    soldAt: NOW - 40 * D,
  },
  {
    id: "sold_15",
    title: "Urban Nights #11",
    setName: "Urban Pulse",
    creator: "citymuse.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=200&q=80",
    mediaType: "photo",
    rarity: "Common",
    salePrice: 42,
    soldAt: NOW - 60 * D,
  },
  {
    id: "sold_16",
    title: "Forest Dawn #5",
    setName: "Forest Walks",
    creator: "woodsy.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=200&q=80",
    mediaType: "video",
    rarity: "Rare",
    salePrice: 310,
    soldAt: NOW - 80 * D,
  },
  {
    id: "sold_17",
    title: "Dusk Horizon #2",
    setName: "Golden Hour Set",
    creator: "light.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&q=80",
    mediaType: "photo",
    rarity: "Common",
    salePrice: 33,
    soldAt: NOW - 120 * D,
  },
  {
    id: "sold_18",
    title: "Canyon Echo #1",
    setName: "Desert Wind",
    creator: "sandstorm.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1433360405326-e50f909805b3?w=200&q=80",
    mediaType: "video",
    rarity: "Rare",
    salePrice: 280,
    soldAt: NOW - 200 * D,
  },
  {
    id: "sold_19",
    title: "River Rush #3",
    setName: "River Moments",
    creator: "flowstate.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=200&q=80",
    mediaType: "photo",
    rarity: "Common",
    salePrice: 22,
    soldAt: NOW - 280 * D,
  },
  {
    id: "sold_20",
    title: "City Grid #7",
    setName: "Urban Pulse",
    creator: "citymuse.icp",
    imageUrl:
      "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=200&q=80",
    mediaType: "video",
    rarity: "Rare",
    salePrice: 195,
    soldAt: NOW - 350 * D,
  },
];

// ─── Time Filter ──────────────────────────────────────────────────────────────

type TimeRange = "24H" | "7D" | "1M" | "1Y" | "ALL_TIME";

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: "24H", value: "24H" },
  { label: "7D", value: "7D" },
  { label: "1M", value: "1M" },
  { label: "1Y", value: "1Y" },
  { label: "All Time", value: "ALL_TIME" },
];

function getTimeThreshold(range: TimeRange): number {
  switch (range) {
    case "24H":
      return NOW - D;
    case "7D":
      return NOW - 7 * D;
    case "1M":
      return NOW - 30 * D;
    case "1Y":
      return NOW - 365 * D;
    default:
      return 0;
  }
}

function filterAndSortNFTs(range: TimeRange): SoldNFT[] {
  const threshold = getTimeThreshold(range);
  return SOLD_NFTS.filter((nft) => nft.soldAt >= threshold).sort(
    (a, b) => b.salePrice - a.salePrice,
  );
}

// ─── Signal Card ─────────────────────────────────────────────────────────────

function SignalCard({
  label,
  plainValue,
  index,
  accentColor,
  accentRgb,
}: {
  label: string;
  plainValue: string;
  index: number;
  accentColor: string;
  accentRgb: string;
}) {
  const cardStyle = {
    background: `rgba(${accentRgb}, 0.07)`,
    border: `1px solid rgba(${accentRgb}, 0.18)`,
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
        style={{ color: "var(--echo-text-secondary)" }}
      >
        {label}
      </p>
      <p
        className="text-base font-mono font-semibold tabular-nums leading-tight"
        style={{ color: accentColor }}
      >
        {plainValue}
      </p>
    </motion.div>
  );
}

// ─── Time Filter Pills ────────────────────────────────────────────────────────

function TimeFilterPills({
  active,
  onChange,
  accentColor,
  accentRgb,
}: {
  active: TimeRange;
  onChange: (t: TimeRange) => void;
  accentColor: string;
  accentRgb: string;
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
              background: isActive ? accentColor : "#f3f4f6",
              color: isActive ? "white" : "#6b7280",
              border: isActive ? "1px solid transparent" : "1px solid #e5e7eb",
              boxShadow: isActive
                ? `0 0 12px rgba(${accentRgb}, 0.30)`
                : "none",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Rank Badge ───────────────────────────────────────────────────────────────

const RANK_BADGE_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: "#FEF3C7", color: "#D97706" },
  2: { bg: "#F1F5F9", color: "#64748B" },
  3: { bg: "#FDF4E7", color: "#B45309" },
};

function RankBadge({ rank }: { rank: number }) {
  const style = RANK_BADGE_COLORS[rank];
  if (style) {
    return (
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: style.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 800,
            color: style.color,
          }}
        >
          {rank}
        </span>
      </div>
    );
  }
  return (
    <div
      style={{
        width: 26,
        height: 26,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#9ca3af",
        }}
      >
        {rank}
      </span>
    </div>
  );
}

// ─── Sold NFT Row ─────────────────────────────────────────────────────────────

function SoldNFTRow({
  nft,
  rank,
  accentColor,
  accentRgb,
}: {
  nft: SoldNFT;
  rank: number;
  accentColor: string;
  accentRgb: string;
}) {
  const isTop3 = rank <= 3;
  const textPrimary = "#1a1a1a";
  const textSecondary = "#9ca3af";

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: Math.min(rank * 0.04, 0.5) }}
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
      data-ocid={`discover.item.${rank}`}
      style={{
        background: "white",
        border: isTop3
          ? `1px solid rgba(${accentRgb}, 0.22)`
          : "1px solid #f0f0f0",
        boxShadow: isTop3
          ? `0 2px 12px rgba(${accentRgb}, 0.08)`
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <RankBadge rank={rank} />

      {/* Thumbnail */}
      <div
        style={{
          width: 36,
          height: 45,
          flexShrink: 0,
          borderRadius: 8,
          overflow: "hidden",
          border: isTop3
            ? `1.5px solid rgba(${accentRgb}, 0.30)`
            : "1px solid #e5e7eb",
        }}
      >
        <img
          src={nft.imageUrl}
          alt={nft.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.background = "#f3f4f6";
            (e.target as HTMLImageElement).style.display = "block";
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap">
          <p
            className="font-semibold truncate"
            style={{ fontSize: "13px", color: textPrimary, lineHeight: 1.3 }}
          >
            {nft.title}
          </p>
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              padding: "1px 5px",
              borderRadius: "6px",
              background:
                nft.mediaType === "video"
                  ? "rgba(88,130,233,0.12)"
                  : "rgba(0,0,0,0.06)",
              color: nft.mediaType === "video" ? "#3b5ec6" : "#6b7280",
              flexShrink: 0,
            }}
          >
            {nft.mediaType === "video" ? "🎬" : "📷"}
          </span>
        </div>
        <p
          className="truncate"
          style={{ fontSize: "10px", color: textSecondary, lineHeight: 1.4 }}
        >
          {nft.setName} · by {nft.creator}
        </p>
        {/* Rarity badge */}
        <span
          style={{
            display: "inline-block",
            marginTop: "2px",
            fontSize: "9px",
            fontWeight: 700,
            padding: "1px 6px",
            borderRadius: "6px",
            background:
              nft.rarity === "Rare"
                ? `rgba(${accentRgb}, 0.10)`
                : "rgba(0,0,0,0.04)",
            color: nft.rarity === "Rare" ? accentColor : "#9ca3af",
            border:
              nft.rarity === "Rare"
                ? `1px solid rgba(${accentRgb}, 0.22)`
                : "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {nft.rarity}
        </span>
      </div>

      {/* Sale price */}
      <div className="shrink-0 text-right">
        <p
          className="font-bold tabular-nums"
          style={{
            fontSize: "14px",
            color: accentColor,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          {formatUSD(nft.salePrice)}
        </p>
        <p style={{ fontSize: "9px", color: textSecondary }}>sold</p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface MarketPageProps {
  onAlbumClick?: (albumId: string) => void;
  onSetClick: (slug: string) => void;
}

export function MarketPage({
  onAlbumClick: _onAlbumClick,
  onSetClick: _onSetClick,
}: MarketPageProps) {
  const { activeStyle: activeCycle } = usePackStyle();
  const accentColor = `oklch(${activeCycle.accentOklchLight})`;
  const accentRgb = `${activeCycle.accentR},${activeCycle.accentG},${activeCycle.accentB}`;

  const [timeRange, setTimeRange] = useState<TimeRange>("ALL_TIME");

  const filteredNFTs = filterAndSortNFTs(timeRange);

  // Compute total volume and other metrics from sold data
  const allTimeSales = SOLD_NFTS.reduce((sum, n) => sum + n.salePrice, 0);
  const last24hSales = SOLD_NFTS.filter((n) => n.soldAt >= NOW - D).reduce(
    (sum, n) => sum + n.salePrice,
    0,
  );
  const totalTx = SOLD_NFTS.length;

  const timeLabel =
    TIME_RANGES.find((t) => t.value === timeRange)?.label ?? "All Time";

  return (
    <div className="px-4 md:px-6 pt-6 pb-32 max-w-2xl mx-auto">
      {/* ── Signal cards ── */}
      <div className="grid grid-cols-2 gap-2.5 mb-2">
        <SignalCard
          label="Total Volume"
          plainValue={`$${allTimeSales.toLocaleString()}`}
          index={0}
          accentColor={accentColor}
          accentRgb={accentRgb}
        />
        <SignalCard
          label="24H Volume"
          plainValue={
            last24hSales > 0 ? `$${last24hSales.toLocaleString()}` : "$0"
          }
          index={1}
          accentColor={accentColor}
          accentRgb={accentRgb}
        />
        <SignalCard
          label="Total Transactions"
          plainValue={`${totalTx} sales`}
          index={2}
          accentColor={accentColor}
          accentRgb={accentRgb}
        />
        <SignalCard
          label="Live Users"
          plainValue="1,284 active"
          index={3}
          accentColor={accentColor}
          accentRgb={accentRgb}
        />
      </div>

      {/* ── Time filter pills ── */}
      <TimeFilterPills
        active={timeRange}
        onChange={setTimeRange}
        accentColor={accentColor}
        accentRgb={accentRgb}
      />

      {/* ── Section header ── */}
      <div
        className="flex items-center gap-2 mt-5 mb-3"
        data-ocid="discover.rankings.section"
      >
        <span style={{ fontSize: "16px" }}>🏆</span>
        <p
          className="text-[11px] uppercase tracking-[0.14em] font-semibold"
          style={{ color: accentColor }}
        >
          Highest Sales · {timeLabel}
        </p>
        <div
          style={{
            flex: 1,
            height: "1px",
            background: `rgba(${accentRgb}, 0.15)`,
            marginLeft: "4px",
          }}
        />
      </div>

      {/* ── Leaderboard ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={timeRange}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
        >
          {filteredNFTs.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-14 text-center"
              data-ocid="discover.rankings.empty_state"
            >
              <p
                style={{
                  color: "#1a1a1a",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                No sales recorded in this period
              </p>
              <p style={{ color: "#9ca3af", fontSize: "12px" }}>
                Try a broader time range to see top sold NFTs.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredNFTs.map((nft, i) => (
                <SoldNFTRow
                  key={nft.id}
                  nft={nft}
                  rank={i + 1}
                  accentColor={accentColor}
                  accentRgb={accentRgb}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
