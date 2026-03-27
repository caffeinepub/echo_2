import { Loader2, Pause, Play, Search, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SolSymbol } from "../components/SolSymbol";
import { useAudioPlayer } from "../context/AudioPlayerContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type SortMode = "marketcap" | "volume" | "change";

interface AlbumEntry {
  id: string;
  title: string;
  artist: string;
  artworkSrc: string | null;
  floor_price_sol: number;
  editions_in_circulation: number;
  total_supply: number;
  volume_24h_sol: number;
  transaction_volume: number;
  listening_volume: number;
  listeners: number;
  plays_raw: number;
  change_24h_pct: number;
  preview_url: string;
  daysAtNumber1: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const BASE_ALBUMS: AlbumEntry[] = [
  {
    id: "echo_001",
    title: "Fragments",
    artist: "Halo Drift",
    artworkSrc: "/assets/generated/album-fragments.dim_600x600.jpg",
    floor_price_sol: 2.6,
    editions_in_circulation: 89,
    total_supply: 150,
    volume_24h_sol: 18.4,
    transaction_volume: 18.4,
    listening_volume: 142000,
    listeners: 2400,
    plays_raw: 142000,
    change_24h_pct: 12.2,
    preview_url: "",
    daysAtNumber1: 35,
  },
  {
    id: "echo_002",
    title: "Charcoal",
    artist: "Vessel",
    artworkSrc: "/assets/generated/album-charcoal.dim_600x600.jpg",
    floor_price_sol: 1.8,
    editions_in_circulation: 61,
    total_supply: 120,
    volume_24h_sol: 7.8,
    transaction_volume: 7.8,
    listening_volume: 118000,
    listeners: 1800,
    plays_raw: 118000,
    change_24h_pct: 4.7,
    preview_url: "",
    daysAtNumber1: 0,
  },
  {
    id: "ta-03",
    title: "Pale Shore",
    artist: "Mira Fold",
    artworkSrc: null,
    floor_price_sol: 1.4,
    editions_in_circulation: 45,
    total_supply: 100,
    volume_24h_sol: 5.2,
    transaction_volume: 5.2,
    listening_volume: 97000,
    listeners: 970,
    plays_raw: 97000,
    change_24h_pct: -2.1,
    preview_url: "",
    daysAtNumber1: 0,
  },
  {
    id: "ta-04",
    title: "Overgrowth",
    artist: "Kin Solar",
    artworkSrc: null,
    floor_price_sol: 1.1,
    editions_in_circulation: 38,
    total_supply: 80,
    volume_24h_sol: 3.8,
    transaction_volume: 3.8,
    listening_volume: 83000,
    listeners: 830,
    plays_raw: 83000,
    change_24h_pct: 8.3,
    preview_url: "",
    daysAtNumber1: 0,
  },
  {
    id: "ta-05",
    title: "Solstice",
    artist: "Null Tide",
    artworkSrc: null,
    floor_price_sol: 0.9,
    editions_in_circulation: 52,
    total_supply: 90,
    volume_24h_sol: 4.1,
    transaction_volume: 4.1,
    listening_volume: 74000,
    listeners: 740,
    plays_raw: 74000,
    change_24h_pct: -0.8,
    preview_url: "",
    daysAtNumber1: 0,
  },
  {
    id: "ta-06",
    title: "Dusk Index",
    artist: "Aeris",
    artworkSrc: null,
    floor_price_sol: 1.2,
    editions_in_circulation: 31,
    total_supply: 75,
    volume_24h_sol: 3.2,
    transaction_volume: 3.2,
    listening_volume: 68000,
    listeners: 680,
    plays_raw: 68000,
    change_24h_pct: 6.1,
    preview_url: "",
    daysAtNumber1: 0,
  },
  {
    id: "ta-07",
    title: "Between Layers",
    artist: "Slow Form",
    artworkSrc: null,
    floor_price_sol: 0.7,
    editions_in_circulation: 28,
    total_supply: 60,
    volume_24h_sol: 2.1,
    transaction_volume: 2.1,
    listening_volume: 61000,
    listeners: 610,
    plays_raw: 61000,
    change_24h_pct: 1.4,
    preview_url: "",
    daysAtNumber1: 0,
  },
  {
    id: "ta-08",
    title: "Mirage",
    artist: "Echo Field",
    artworkSrc: null,
    floor_price_sol: 0.6,
    editions_in_circulation: 24,
    total_supply: 50,
    volume_24h_sol: 1.8,
    transaction_volume: 1.8,
    listening_volume: 54000,
    listeners: 540,
    plays_raw: 54000,
    change_24h_pct: -3.5,
    preview_url: "",
    daysAtNumber1: 0,
  },
];

// ─── Crown Icon ───────────────────────────────────────────────────────────────
function CrownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-crown-float"
      style={{ filter: "drop-shadow(0 0 6px #D4AF37aa)" }}
      role="img"
      aria-label="#1 crown"
    >
      <path
        d="M2 20h20M5 20l-1-9 5 4 3-6 3 6 5-4-1 9"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Signal Card ──────────────────────────────────────────────────────────────
function SignalCard({
  label,
  value,
  isSol,
  index,
  accent,
}: {
  label: string;
  value: string;
  isSol: boolean;
  index: number;
  accent?: "violet" | "cyan";
}) {
  const borderColor =
    accent === "violet"
      ? "oklch(0.55 0.25 290 / 0.3)"
      : accent === "cyan"
        ? "oklch(0.82 0.15 210 / 0.25)"
        : "oklch(0.18 0.007 240)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 + index * 0.07 }}
      className="rounded-2xl px-4 py-3.5 flex flex-col gap-1.5"
      style={{
        background: "oklch(0.10 0.006 240)",
        border: `1px solid ${borderColor}`,
        boxShadow:
          accent === "cyan"
            ? "0 0 24px oklch(0.82 0.15 210 / 0.08), inset 0 1px 0 oklch(0.82 0.15 210 / 0.05)"
            : accent === "violet"
              ? "0 0 24px oklch(0.55 0.25 290 / 0.08), inset 0 1px 0 oklch(0.55 0.25 290 / 0.05)"
              : undefined,
      }}
    >
      <p
        className="text-[9px] uppercase tracking-[0.16em] font-medium"
        style={{ color: "oklch(0.45 0.008 240)" }}
      >
        {label}
      </p>
      <p
        className="text-base font-mono font-semibold tabular-nums leading-tight flex items-center gap-2"
        style={{
          color: isSol ? "oklch(0.82 0.15 210)" : "oklch(0.94 0.005 220)",
        }}
      >
        {isSol && <SolSymbol className="w-3.5 h-3.5" />}
        {value}
      </p>
    </motion.div>
  );
}

// ─── Change badge ─────────────────────────────────────────────────────────────
function ChangeBadge({ pct, flash }: { pct: number; flash?: boolean }) {
  const positive = pct >= 0;
  return (
    <span
      className={`text-[12px] font-mono tabular-nums shrink-0 font-medium ${
        flash ? "animate-value-flash" : ""
      }`}
      style={{
        color: positive ? "oklch(0.76 0.18 160)" : "oklch(0.65 0.22 10)",
        textShadow: positive
          ? "0 0 8px oklch(0.76 0.18 160 / 0.5)"
          : "0 0 8px oklch(0.65 0.22 10 / 0.5)",
      }}
    >
      {positive ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

// ─── Artwork circle ───────────────────────────────────────────────────────────
function ArtCircle({
  src,
  title,
  isPlaying,
  onPress,
}: {
  src: string | null;
  title: string;
  isPlaying: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onPress();
      }}
      aria-label={isPlaying ? `Pause ${title}` : `Preview ${title}`}
      className="relative shrink-0 focus:outline-none group"
      style={{ width: 56, height: 56 }}
    >
      {/* Spinning ring + glow when playing */}
      {isPlaying && (
        <span
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow:
              "0 0 0 2px oklch(0.55 0.25 290 / 0.85), 0 0 18px oklch(0.55 0.25 290 / 0.45)",
          }}
        />
      )}
      {/* Art circle */}
      <div
        className={`w-full h-full rounded-full overflow-hidden ${
          isPlaying ? "animate-spin-slow" : ""
        }`}
      >
        {src ? (
          <img src={src} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full rounded-full"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.18 0.007 240), oklch(0.13 0.006 240))",
            }}
          />
        )}
      </div>
      {/* Play/pause overlay */}
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "oklch(0.05 0.003 240 / 0.7)" }}
      >
        {isPlaying ? (
          <Pause
            className="w-4 h-4"
            style={{ color: "oklch(0.96 0.005 220)" }}
          />
        ) : (
          <Play
            className="w-4 h-4 ml-0.5"
            style={{ color: "oklch(0.96 0.005 220)" }}
          />
        )}
      </div>
    </button>
  );
}

// ─── Album Row ────────────────────────────────────────────────────────────────
function AlbumRow({
  album,
  rank,
  sortMode,
  onPreviewToggle,
  onAlbumClick,
  index,
  flashId,
}: {
  album: AlbumEntry;
  rank: number;
  sortMode: SortMode;
  onPreviewToggle: (album: AlbumEntry) => void;
  onAlbumClick: (id: string) => void;
  index: number;
  flashId: string | null;
}) {
  const { currentTrack, isPlaying } = useAudioPlayer();
  const isActive = currentTrack?.id === album.id && isPlaying;
  const mktCap = album.floor_price_sol * album.editions_in_circulation;
  const isFlashing = flashId === album.id;
  const isHot = album.change_24h_pct > 5;
  const hasCrown = rank === 1 && album.daysAtNumber1 >= 30;

  let metricNode: React.ReactNode;
  switch (sortMode) {
    case "marketcap":
      metricNode = (
        <span
          className={`text-[13px] font-mono tabular-nums flex items-center gap-1.5 ${
            isFlashing ? "animate-value-flash" : ""
          }`}
          style={{ color: "oklch(0.82 0.15 210)" }}
        >
          <SolSymbol className="w-3 h-3" animated={true} />
          {mktCap.toFixed(1)}
        </span>
      );
      break;
    case "volume":
      metricNode = (
        <span
          className={`text-[13px] font-mono tabular-nums flex items-center gap-1.5 ${
            isFlashing ? "animate-value-flash" : ""
          }`}
          style={{ color: "oklch(0.82 0.15 210)" }}
        >
          <SolSymbol className="w-3 h-3" animated={true} />
          {album.volume_24h_sol.toFixed(1)}
        </span>
      );
      break;
    case "change":
      metricNode = (
        <ChangeBadge pct={album.change_24h_pct} flash={isFlashing} />
      );
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      data-ocid={`discover.item.${rank}`}
      onClick={() => onAlbumClick(album.id)}
      className="flex items-center gap-3 px-4 py-3.5 mb-1.5 rounded-2xl cursor-pointer transition-colors"
      style={{
        background: isActive
          ? "oklch(0.12 0.012 290)"
          : "oklch(0.10 0.006 240)",
        border: isActive
          ? "1px solid oklch(0.55 0.25 290 / 0.35)"
          : "1px solid oklch(0.16 0.006 240)",
        boxShadow:
          isHot && !isActive
            ? "0 0 0 0 transparent"
            : isActive
              ? "0 0 20px oklch(0.55 0.25 290 / 0.12)"
              : undefined,
      }}
    >
      {/* Rank */}
      <div className="w-6 shrink-0 flex items-center justify-center">
        {hasCrown ? (
          <CrownIcon />
        ) : (
          <span
            className="text-[12px] tabular-nums font-mono"
            style={{
              color:
                rank <= 3 ? "oklch(0.70 0.005 220)" : "oklch(0.35 0.005 240)",
            }}
          >
            {rank}
          </span>
        )}
      </div>

      {/* Album art */}
      <ArtCircle
        src={album.artworkSrc}
        title={album.title}
        isPlaying={isActive}
        onPress={() => onPreviewToggle(album)}
      />

      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[14px] font-medium truncate leading-tight"
          style={{ color: "oklch(0.94 0.005 220)" }}
        >
          {album.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p
            className="text-[11px] truncate"
            style={{ color: "oklch(0.42 0.008 240)" }}
          >
            {album.artist}
          </p>
          {isHot && (
            <TrendingUp
              className="w-3 h-3 shrink-0"
              style={{ color: "oklch(0.76 0.18 160)" }}
            />
          )}
        </div>
      </div>

      {/* Metric */}
      <div className="text-right min-w-[60px]">{metricNode}</div>

      {/* Change */}
      <div className="w-[56px] text-right">
        <ChangeBadge pct={album.change_24h_pct} />
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
interface MarketPageProps {
  onAlbumClick: (albumId: string) => void;
}

export function MarketPage({ onAlbumClick }: MarketPageProps) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("marketcap");
  const [albums, setAlbums] = useState<AlbumEntry[]>(BASE_ALBUMS);
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { currentTrack, play, stop } = useAudioPlayer();

  // ── Live market cap update (every 60s) ──
  useEffect(() => {
    const timer = setInterval(() => {
      setAlbums((prev) =>
        prev.map((a) => {
          const delta = 1 + (Math.random() * 0.04 - 0.02); // ±2%
          const updated = {
            ...a,
            floor_price_sol: Math.max(0.01, a.floor_price_sol * delta),
          };
          return updated;
        }),
      );
      // flash a random album
      const randomId =
        BASE_ALBUMS[Math.floor(Math.random() * BASE_ALBUMS.length)].id;
      setFlashId(randomId);
      setTimeout(() => setFlashId(null), 900);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // ── Ranking re-sort (every 90s) ──
  useEffect(() => {
    const timer = setInterval(() => {
      setAlbums((prev) => {
        const sorted = [...prev].sort(
          (a, b) =>
            b.floor_price_sol * b.editions_in_circulation -
            a.floor_price_sol * a.editions_in_circulation,
        );
        return sorted;
      });
    }, 90000);
    return () => clearInterval(timer);
  }, []);

  // ── Infinite scroll observer ──
  const loadMore = useCallback(() => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((c) => c + 4);
      setIsLoadingMore(false);
    }, 600);
  }, [isLoadingMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "100px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  function handlePreviewToggle(album: AlbumEntry) {
    if (currentTrack?.id === album.id) {
      stop();
    } else {
      play({
        id: album.id,
        title: album.title,
        artist: album.artist,
        artworkSrc: album.artworkSrc,
        preview_url: album.preview_url,
      });
    }
  }

  const sortedAlbums = useMemo(() => {
    const list = [...albums];
    if (query.trim()) {
      const q = query.toLowerCase();
      return list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.artist.toLowerCase().includes(q),
      );
    }
    switch (sortMode) {
      case "marketcap":
        return list.sort(
          (a, b) =>
            b.floor_price_sol * b.editions_in_circulation -
            a.floor_price_sol * a.editions_in_circulation,
        );
      case "volume":
        return list.sort((a, b) => b.volume_24h_sol - a.volume_24h_sol);
      case "change":
        return list.sort((a, b) => b.change_24h_pct - a.change_24h_pct);
    }
  }, [sortMode, query, albums]);

  // For infinite scroll — extend with duplicates for demo
  const extendedAlbums = useMemo(() => {
    const result = [...sortedAlbums];
    if (result.length < visibleCount) {
      const extras = sortedAlbums.map((a, i) => ({
        ...a,
        id: `${a.id}-x${i}`,
      }));
      result.push(...extras);
    }
    return result.slice(0, visibleCount);
  }, [sortedAlbums, visibleCount]);

  const SORT_OPTIONS: { key: SortMode; label: string }[] = [
    { key: "marketcap", label: "MARKET CAP" },
    { key: "volume", label: "VOLUME" },
    { key: "change", label: "CHANGE" },
  ];

  return (
    <div className="px-4 md:px-6 pt-6 pb-32 max-w-2xl mx-auto">
      {/* ── Search ── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative mb-6"
      >
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "oklch(0.50 0.010 240)" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search albums, artists, tracks…"
          data-ocid="discover.search_input"
          className="w-full pl-10 pr-4 py-3 text-sm outline-none transition-all rounded-2xl"
          style={{
            background: "oklch(0.11 0.006 240)",
            border: "1px solid oklch(0.20 0.007 240)",
            color: "oklch(0.88 0.005 220)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "oklch(0.55 0.25 290 / 0.6)";
            e.currentTarget.style.boxShadow =
              "0 0 0 1px oklch(0.55 0.25 290 / 0.15), 0 0 20px oklch(0.55 0.25 290 / 0.08)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "oklch(0.20 0.007 240)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </motion.div>

      {/* ── Signal cards ── */}
      {!query.trim() && (
        <div className="grid grid-cols-2 gap-2.5 mb-8">
          <SignalCard
            label="Total Market Cap"
            value="1,847"
            isSol={true}
            index={0}
            accent="cyan"
          />
          <SignalCard
            label="24H Volume"
            value="312.4"
            isSol={true}
            index={1}
            accent="cyan"
          />
          <SignalCard
            label="Active Listeners"
            value="14.2k"
            isSol={false}
            index={2}
          />
          <SignalCard
            label="Live Releases"
            value="3"
            isSol={false}
            index={3}
            accent="violet"
          />
        </div>
      )}

      {/* ── Leaderboard panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        {/* Header */}
        {!query.trim() && (
          <div className="flex items-center justify-between mb-4">
            {/* Sort pills */}
            <div className="flex items-center gap-1" data-ocid="discover.tab">
              {SORT_OPTIONS.map((opt) => {
                const active = sortMode === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSortMode(opt.key)}
                    className="px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-wider uppercase transition-all cursor-pointer"
                    style={{
                      background: active
                        ? "oklch(0.55 0.25 290 / 0.18)"
                        : "transparent",
                      color: active
                        ? "oklch(0.78 0.20 290)"
                        : "oklch(0.40 0.008 240)",
                      border: active
                        ? "1px solid oklch(0.55 0.25 290 / 0.35)"
                        : "1px solid transparent",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "oklch(0.76 0.18 160)",
                  animation: "live-dot 1.8s ease-in-out infinite",
                  boxShadow: "0 0 6px oklch(0.76 0.18 160 / 0.7)",
                }}
              />
              <span
                className="text-[9px] font-semibold tracking-[0.14em] uppercase"
                style={{ color: "oklch(0.76 0.18 160)" }}
              >
                Updating live
              </span>
            </div>
          </div>
        )}

        {/* Column headers */}
        <div
          className="flex items-center gap-3 px-4 mb-2"
          style={{ color: "oklch(0.35 0.006 240)" }}
        >
          <span className="w-6 shrink-0" />
          <span className="w-14 shrink-0" />
          <span className="flex-1 text-[9px] uppercase tracking-widest">
            Album
          </span>
          <span className="text-[9px] uppercase tracking-widest min-w-[60px] text-right">
            {sortMode === "marketcap"
              ? "MCap"
              : sortMode === "volume"
                ? "Vol"
                : "Change"}
          </span>
          <span className="text-[9px] uppercase tracking-widest w-14 text-right">
            24H
          </span>
        </div>

        {/* Rows */}
        {extendedAlbums.length === 0 ? (
          <p
            data-ocid="discover.empty_state"
            className="text-sm py-12 text-center"
            style={{ color: "oklch(0.35 0.006 240)" }}
          >
            No albums found
          </p>
        ) : (
          <div>
            {extendedAlbums.map((album, i) => (
              <AlbumRow
                key={album.id}
                album={album}
                rank={i + 1}
                sortMode={sortMode}
                onPreviewToggle={handlePreviewToggle}
                onAlbumClick={onAlbumClick}
                index={i}
                flashId={flashId}
              />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />
        {isLoadingMore && (
          <div
            className="flex justify-center py-4"
            data-ocid="discover.loading_state"
          >
            <Loader2
              className="w-5 h-5 animate-spin"
              style={{ color: "oklch(0.55 0.25 290 / 0.6)" }}
            />
          </div>
        )}
      </motion.div>

      <p
        className="text-center text-[10px] mt-4 font-mono"
        style={{ color: "oklch(0.28 0.005 240)" }}
      >
        Tap artwork to preview · Click row to explore
      </p>
    </div>
  );
}
