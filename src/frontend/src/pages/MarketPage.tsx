import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { SolSymbol } from "../components/SolSymbol";
import { useAudioPlayer } from "../context/AudioPlayerContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type SortMode = "marketcap" | "volume" | "listeners" | "plays";
type TimeRange = "24H" | "7D" | "30D" | "All";

interface AlbumEntry {
  id: string;
  title: string;
  artist: string;
  artworkSrc: string | null;
  floor_price_sol: number;
  editions_in_circulation: number;
  volume_24h_sol: number;
  listeners: number;
  plays_raw: number;
  change_24h_pct: number;
  preview_url: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const TOP_ALBUMS: AlbumEntry[] = [
  {
    id: "ta-01",
    title: "Fragments",
    artist: "Halo Drift",
    artworkSrc: "/assets/generated/album-fragments.dim_600x600.jpg",
    floor_price_sol: 2.6,
    editions_in_circulation: 89,
    volume_24h_sol: 18.4,
    listeners: 2400,
    plays_raw: 142000,
    change_24h_pct: 12.2,
    preview_url: "",
  },
  {
    id: "ta-02",
    title: "Charcoal",
    artist: "Vessel",
    artworkSrc: "/assets/generated/album-charcoal.dim_600x600.jpg",
    floor_price_sol: 1.8,
    editions_in_circulation: 61,
    volume_24h_sol: 7.8,
    listeners: 1800,
    plays_raw: 118000,
    change_24h_pct: 4.7,
    preview_url: "",
  },
  {
    id: "ta-03",
    title: "Pale Shore",
    artist: "Mira Fold",
    artworkSrc: null,
    floor_price_sol: 1.4,
    editions_in_circulation: 45,
    volume_24h_sol: 5.2,
    listeners: 970,
    plays_raw: 97000,
    change_24h_pct: -2.1,
    preview_url: "",
  },
  {
    id: "ta-04",
    title: "Overgrowth",
    artist: "Kin Solar",
    artworkSrc: null,
    floor_price_sol: 1.1,
    editions_in_circulation: 38,
    volume_24h_sol: 3.8,
    listeners: 830,
    plays_raw: 83000,
    change_24h_pct: 8.3,
    preview_url: "",
  },
  {
    id: "ta-05",
    title: "Solstice",
    artist: "Null Tide",
    artworkSrc: null,
    floor_price_sol: 0.9,
    editions_in_circulation: 52,
    volume_24h_sol: 4.1,
    listeners: 740,
    plays_raw: 74000,
    change_24h_pct: -0.8,
    preview_url: "",
  },
  {
    id: "ta-06",
    title: "Dusk Index",
    artist: "Aeris",
    artworkSrc: null,
    floor_price_sol: 1.2,
    editions_in_circulation: 31,
    volume_24h_sol: 3.2,
    listeners: 680,
    plays_raw: 68000,
    change_24h_pct: 6.1,
    preview_url: "",
  },
  {
    id: "ta-07",
    title: "Between Layers",
    artist: "Slow Form",
    artworkSrc: null,
    floor_price_sol: 0.7,
    editions_in_circulation: 28,
    volume_24h_sol: 2.1,
    listeners: 610,
    plays_raw: 61000,
    change_24h_pct: 1.4,
    preview_url: "",
  },
  {
    id: "ta-08",
    title: "Mirage",
    artist: "Echo Field",
    artworkSrc: null,
    floor_price_sol: 0.6,
    editions_in_circulation: 24,
    volume_24h_sol: 1.8,
    listeners: 540,
    plays_raw: 54000,
    change_24h_pct: -3.5,
    preview_url: "",
  },
];

// ─── Signal card data ─────────────────────────────────────────────────────────
const SIGNAL_CARDS = [
  { label: "Total Market Cap", value: "1,847", isSol: true },
  { label: "24H Volume", value: "312.4", isSol: true },
  { label: "Active Listeners", value: "14.2k", isSol: false },
  { label: "Live Releases", value: "3", isSol: false },
];

// ─── Album Artwork Icon ───────────────────────────────────────────────────────
function AlbumArtwork({
  artworkSrc,
  title,
  isPlaying,
  onPress,
}: {
  artworkSrc: string | null;
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
      className="relative w-11 h-11 shrink-0 rounded-full cursor-pointer focus:outline-none"
      style={{ animation: isPlaying ? "spin 8s linear infinite" : "none" }}
      aria-label={isPlaying ? `Stop preview of ${title}` : `Preview ${title}`}
    >
      <div className="w-full h-full rounded-full overflow-hidden">
        {artworkSrc ? (
          <img
            src={artworkSrc}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-white/[0.06]" />
        )}
      </div>
    </button>
  );
}

// ─── Signal card ──────────────────────────────────────────────────────────────
function SignalCard({
  label,
  value,
  isSol,
  index,
}: {
  label: string;
  value: string;
  isSol: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white/[0.02] border border-white/[0.05] rounded-2xl px-4 py-3 flex flex-col gap-1"
    >
      <p className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-medium">
        {label}
      </p>
      <p className="text-base font-mono font-medium text-foreground/85 tabular-nums leading-tight">
        {isSol && <SolSymbol className="w-3 h-3 mr-2" />}
        {value}
      </p>
    </motion.div>
  );
}

// ─── Change badge ─────────────────────────────────────────────────────────────
function ChangeBadge({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <span
      className={`text-[11px] font-mono tabular-nums shrink-0 ${
        positive ? "text-emerald-400/80" : "text-muted-foreground/50"
      }`}
    >
      {positive ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

// ─── Album row ────────────────────────────────────────────────────────────────
function AlbumRow({
  album,
  rank,
  sortMode,
  onPreviewToggle,
  index,
}: {
  album: AlbumEntry;
  rank: number;
  sortMode: SortMode;
  onPreviewToggle: (album: AlbumEntry) => void;
  index: number;
}) {
  const { currentTrack, isPlaying } = useAudioPlayer();
  const isActive = currentTrack?.id === album.id && isPlaying;
  const mktCap = album.floor_price_sol * album.editions_in_circulation;

  let metricNode: React.ReactNode;
  switch (sortMode) {
    case "marketcap":
      metricNode = (
        <span className="text-[12px] font-mono tabular-nums text-foreground/70">
          <SolSymbol className="w-3 h-3 mr-2" />
          {mktCap.toFixed(1)}
        </span>
      );
      break;
    case "volume":
      metricNode = (
        <span className="text-[12px] font-mono tabular-nums text-foreground/70">
          <SolSymbol className="w-3 h-3 mr-2" />
          {album.volume_24h_sol.toFixed(1)}
        </span>
      );
      break;
    case "listeners":
      metricNode = (
        <span className="text-[12px] font-mono tabular-nums text-foreground/70">
          {album.listeners >= 1000
            ? `${(album.listeners / 1000).toFixed(1)}k`
            : album.listeners}
        </span>
      );
      break;
    case "plays":
      metricNode = (
        <span className="text-[12px] font-mono tabular-nums text-foreground/70">
          {album.plays_raw >= 1000
            ? `${Math.round(album.plays_raw / 1000)}k`
            : album.plays_raw}
        </span>
      );
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      data-ocid={`discover.item.${rank}`}
      className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg px-2 -mx-2"
    >
      {/* Rank */}
      <span className="text-[11px] tabular-nums text-muted-foreground/30 w-5 shrink-0 text-right font-mono">
        {rank}
      </span>

      {/* Album artwork */}
      <AlbumArtwork
        artworkSrc={album.artworkSrc}
        title={album.title}
        isPlaying={isActive}
        onPress={() => onPreviewToggle(album)}
      />

      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground/90 truncate leading-tight">
          {album.title}
        </p>
        <p className="text-[11px] text-muted-foreground/45 truncate mt-0.5">
          {album.artist}
        </p>
      </div>

      {/* Metric + floor + vol — hide some on mobile */}
      <div className="hidden sm:flex items-center gap-5">
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground/30 mb-0.5">
            Floor
          </p>
          <span className="text-[12px] font-mono tabular-nums text-foreground/60">
            <SolSymbol className="w-3 h-3 mr-2" />
            {album.floor_price_sol.toFixed(1)}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground/30 mb-0.5">
            Vol
          </p>
          <span className="text-[12px] font-mono tabular-nums text-foreground/60">
            <SolSymbol className="w-3 h-3 mr-2" />
            {album.volume_24h_sol.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Primary metric */}
      <div className="text-right min-w-[56px]">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground/30 mb-0.5 hidden sm:block">
          {sortMode === "marketcap"
            ? "MCap"
            : sortMode === "volume"
              ? "Vol"
              : sortMode === "listeners"
                ? "Listeners"
                : "Plays"}
        </p>
        {metricNode}
      </div>

      {/* 24H change */}
      <div className="w-14 text-right">
        <ChangeBadge pct={album.change_24h_pct} />
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
interface MarketPageProps {
  onAlbumClick: (albumId: string) => void;
}

export function MarketPage({ onAlbumClick: _onAlbumClick }: MarketPageProps) {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("marketcap");
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const { currentTrack, play, stop } = useAudioPlayer();

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
    const list = [...TOP_ALBUMS];
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
      case "listeners":
        return list.sort((a, b) => b.listeners - a.listeners);
      case "plays":
        return list.sort((a, b) => b.plays_raw - a.plays_raw);
    }
  }, [sortMode, query]);

  const SORT_OPTIONS: { key: SortMode; label: string }[] = [
    { key: "marketcap", label: "Market Cap" },
    { key: "volume", label: "Volume" },
    { key: "listeners", label: "Listeners" },
    { key: "plays", label: "Plays" },
  ];

  const TIME_OPTIONS: TimeRange[] = ["24H", "7D", "30D", "All"];

  return (
    <div className="px-5 md:px-8 pt-7 pb-28 max-w-3xl mx-auto">
      {/* ── Search ── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative mb-6"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/35 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search albums, artists, tracks…"
          data-ocid="discover.search_input"
          className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground/80 placeholder:text-muted-foreground/25 outline-none focus:border-white/[0.15] transition-colors"
        />
      </motion.div>

      {/* ── Signal cards ── */}
      {!query.trim() && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8"
        >
          {SIGNAL_CARDS.map((card, i) => (
            <SignalCard
              key={card.label}
              label={card.label}
              value={card.value}
              isSol={card.isSol}
              index={i}
            />
          ))}
        </motion.div>
      )}

      {/* ── Ranking panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white/[0.02] border border-white/[0.05] rounded-2xl px-4 py-4"
      >
        {/* Controls */}
        {!query.trim() && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            {/* Sort pills */}
            <div className="flex items-center gap-3" data-ocid="discover.tab">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSortMode(opt.key)}
                  className={`text-[10px] uppercase tracking-widest font-medium transition-colors cursor-pointer ${
                    sortMode === opt.key
                      ? "text-foreground/90"
                      : "text-muted-foreground/30 hover:text-muted-foreground/55"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Separator */}
            <span className="hidden sm:block w-px h-3 bg-white/10 shrink-0" />

            {/* Time range */}
            <div className="flex items-center gap-2">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeRange(t)}
                  className={`text-[10px] uppercase tracking-widest font-medium transition-colors cursor-pointer ${
                    timeRange === t
                      ? "text-foreground/90"
                      : "text-muted-foreground/30 hover:text-muted-foreground/55"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Column headers */}
        <div className="flex items-center gap-3 px-2 -mx-2 mb-1">
          <span className="w-5 shrink-0" />
          <span className="w-11 shrink-0" />
          <span className="flex-1 text-[9px] uppercase tracking-widest text-muted-foreground/30">
            Album
          </span>
          <span className="hidden sm:flex items-center gap-5">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/30 w-[52px] text-right">
              Floor
            </span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/30 w-[52px] text-right">
              Vol
            </span>
          </span>
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground/30 min-w-[56px] text-right">
            {sortMode === "marketcap"
              ? "MCap"
              : sortMode === "volume"
                ? "Vol"
                : sortMode === "listeners"
                  ? "Listeners"
                  : "Plays"}
          </span>
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground/30 w-14 text-right">
            24H
          </span>
        </div>

        {/* Album rows */}
        {sortedAlbums.length === 0 ? (
          <p
            data-ocid="discover.empty_state"
            className="text-sm text-muted-foreground/30 py-10 text-center"
          >
            No albums found
          </p>
        ) : (
          <div>
            {sortedAlbums.map((album, i) => (
              <AlbumRow
                key={album.id}
                album={album}
                rank={i + 1}
                sortMode={sortMode}
                onPreviewToggle={handlePreviewToggle}
                index={i}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Footer hint ── */}
      <p className="text-center text-[10px] text-muted-foreground/20 mt-6 font-mono">
        Tap artwork to preview · Rotates while playing
      </p>
    </div>
  );
}
