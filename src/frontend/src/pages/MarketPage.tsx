import { RotateCcw, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SolSymbol } from "../components/SolSymbol";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import { useWalletContext } from "../context/WalletContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type SortMode = "marketcap" | "volume" | "listeners" | "plays";
type TimeRange = "24H" | "7D" | "30D" | "All";

export interface AlbumEntry {
  id: string;
  title: string;
  artist: string;
  artworkSrc: string | null;
  floor_price_sol: number;
  editions_in_circulation: number;
  total_supply: number;
  volume_24h_sol: number;
  listeners: number;
  plays_raw: number;
  change_24h_pct: number;
  preview_url: string;
  mintPrice: number;
  txns: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
export const TOP_ALBUMS: AlbumEntry[] = [
  {
    id: "ta-01",
    title: "Fragments",
    artist: "Halo Drift",
    artworkSrc: "/assets/generated/album-fragments.dim_600x600.jpg",
    floor_price_sol: 2.6,
    editions_in_circulation: 89,
    total_supply: 150,
    volume_24h_sol: 18.4,
    listeners: 2400,
    plays_raw: 142000,
    change_24h_pct: 12.2,
    preview_url: "",
    mintPrice: 1.8,
    txns: 4,
  },
  {
    id: "ta-02",
    title: "Charcoal",
    artist: "Vessel",
    artworkSrc: "/assets/generated/album-charcoal.dim_600x600.jpg",
    floor_price_sol: 1.8,
    editions_in_circulation: 61,
    total_supply: 120,
    volume_24h_sol: 7.8,
    listeners: 1800,
    plays_raw: 118000,
    change_24h_pct: 4.7,
    preview_url: "",
    mintPrice: 2.0,
    txns: 6,
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
    listeners: 970,
    plays_raw: 97000,
    change_24h_pct: -2.1,
    preview_url: "",
    mintPrice: 1.2,
    txns: 3,
  },
  {
    id: "ta-04",
    title: "Overgrowth",
    artist: "Kin Solar",
    artworkSrc: null,
    floor_price_sol: 1.1,
    editions_in_circulation: 38,
    total_supply: 100,
    volume_24h_sol: 3.8,
    listeners: 830,
    plays_raw: 83000,
    change_24h_pct: 8.3,
    preview_url: "",
    mintPrice: 1.2,
    txns: 2,
  },
  {
    id: "ta-05",
    title: "Solstice",
    artist: "Null Tide",
    artworkSrc: null,
    floor_price_sol: 0.9,
    editions_in_circulation: 52,
    total_supply: 100,
    volume_24h_sol: 4.1,
    listeners: 740,
    plays_raw: 74000,
    change_24h_pct: -0.8,
    preview_url: "",
    mintPrice: 1.2,
    txns: 3,
  },
  {
    id: "ta-06",
    title: "Dusk Index",
    artist: "Aeris",
    artworkSrc: null,
    floor_price_sol: 1.2,
    editions_in_circulation: 31,
    total_supply: 100,
    volume_24h_sol: 3.2,
    listeners: 680,
    plays_raw: 68000,
    change_24h_pct: 6.1,
    preview_url: "",
    mintPrice: 1.2,
    txns: 2,
  },
  {
    id: "ta-07",
    title: "Between Layers",
    artist: "Slow Form",
    artworkSrc: null,
    floor_price_sol: 0.7,
    editions_in_circulation: 28,
    total_supply: 100,
    volume_24h_sol: 2.1,
    listeners: 610,
    plays_raw: 61000,
    change_24h_pct: 1.4,
    preview_url: "",
    mintPrice: 1.2,
    txns: 2,
  },
  {
    id: "ta-08",
    title: "Mirage",
    artist: "Echo Field",
    artworkSrc: null,
    floor_price_sol: 0.6,
    editions_in_circulation: 24,
    total_supply: 100,
    volume_24h_sol: 1.8,
    listeners: 540,
    plays_raw: 54000,
    change_24h_pct: -3.5,
    preview_url: "",
    mintPrice: 1.2,
    txns: 2,
  },
];

// ─── Signal card data ─────────────────────────────────────────────────────────
const SIGNAL_CARDS = [
  { label: "Total Market Cap", value: "1,847", isSol: true },
  { label: "24H Volume", value: "312.4", isSol: true },
  { label: "Active Listeners", value: "14.2k", isSol: false },
  { label: "Live Releases", value: "3", isSol: false },
];

// id mappings ta-01 → echo_001 for edition lookups
const OWNED_EDITIONS: Record<string, number> = {
  "ta-01": 42,
  "ta-02": 7,
};

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

// ─── Discover Album Card ──────────────────────────────────────────────────────
function DiscoverAlbumCard({
  album,
  isOwned,
  ownedEdition,
  onOpenModal,
  index,
}: {
  album: AlbumEntry;
  isOwned: boolean;
  ownedEdition?: number;
  onOpenModal: () => void;
  index: number;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasFlipped, setHasFlipped] = useState(false);
  const [flipTransition, setFlipTransition] = useState(false);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [showShimmer, setShowShimmer] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Remove shimmer after one sweep (300ms delay + 600ms animation)
  useEffect(() => {
    const timer = setTimeout(() => setShowShimmer(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  function handleCardClick() {
    setFlipTransition(true);
    setIsFlipped((prev) => !prev);
    if (!hasFlipped) setHasFlipped(true);
    setTimeout(() => setFlipTransition(false), 320);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!wrapperRef.current || flipTransition) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTiltX(x * 6);
    setTiltY(-y * 6);
  }

  function handleMouseLeave() {
    setTiltX(0);
    setTiltY(0);
  }

  const mktCap = (
    album.floor_price_sol * album.editions_in_circulation
  ).toFixed(1);
  const positive = album.change_24h_pct >= 0;
  const changeColor = positive ? "#3DDC97" : "#FF6B6B";

  const innerTransform = `rotateX(${tiltY}deg) rotateY(${
    isFlipped ? 180 + tiltX : tiltX
  }deg)`;
  const innerTransition = flipTransition
    ? "transform 280ms ease-in-out"
    : "transform 80ms ease-out";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.06 }}
      data-ocid={`discover.item.${index + 1}`}
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      style={{ perspective: "800px", cursor: "pointer" }}
      className="relative select-none"
    >
      {/* Inner flip container */}
      <div
        style={{
          position: "relative",
          transformStyle: "preserve-3d",
          transform: innerTransform,
          transition: innerTransition,
          willChange: "transform",
        }}
      >
        {/* ── FRONT FACE ── */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className="rounded-xl overflow-hidden"
        >
          {/* Card ambient background */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 100%)",
              backfaceVisibility: "hidden",
            }}
          >
            {/* Artwork area */}
            <div className="relative w-full aspect-square overflow-hidden">
              {/* Subtle inner glow */}
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)",
                }}
              />
              {album.artworkSrc ? (
                <img
                  src={album.artworkSrc}
                  alt={album.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/[0.05]" />
              )}

              {/* Shimmer sweep — fires once on mount */}
              {showShimmer && (
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "60%",
                      height: "100%",
                      background:
                        "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)",
                      animation: "shimmer-sweep 0.6s ease-out 0.3s forwards",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Card text area */}
            <div
              className="px-3 pt-3 pb-3.5 relative"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.72))",
              }}
            >
              {/* Rotating arrow affordance */}
              <div
                className="absolute top-3 right-3 text-white"
                style={{
                  opacity: 0.35,
                  animation: "spin-arrow 4s linear infinite",
                }}
              >
                <RotateCcw size={11} />
              </div>

              <p className="text-sm font-medium text-foreground/90 truncate pr-5">
                {album.title}
              </p>
              <p className="text-xs text-muted-foreground/50 truncate mt-0.5">
                {album.artist}
              </p>

              {isOwned && ownedEdition && (
                <span className="mt-2 inline-flex items-center text-[10px] text-muted-foreground/55 border border-white/[0.1] px-2 py-0.5 rounded-full">
                  Edition #{String(ownedEdition).padStart(3, "0")}
                </span>
              )}

              {/* TAP TO FLIP hint — fades after first flip */}
              <AnimatePresence>
                {!hasFlipped && (
                  <motion.p
                    initial={{ opacity: 0.45 }}
                    animate={{ opacity: 0.45 }}
                    exit={{ opacity: 0, transition: { duration: 0.4 } }}
                    className="mt-1.5 text-[9px] uppercase text-white"
                    style={{ letterSpacing: "0.12em" }}
                  >
                    Tap to flip
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── BACK FACE ── */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute",
            inset: 0,
          }}
          className="rounded-xl overflow-hidden flex flex-col"
        >
          <div
            className="w-full h-full flex flex-col p-4"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 100%)",
              backgroundColor: "oklch(0.11 0.006 240)",
            }}
          >
            {/* Album name on back */}
            <p
              className="text-[10px] uppercase font-medium truncate mb-[20px]"
              style={{ letterSpacing: "0.1em", color: "#7A7A7A" }}
            >
              {album.title}
            </p>

            {/* 3-column metrics grid */}
            <div className="grid grid-cols-3 flex-1" style={{ gap: "0px" }}>
              {/* MCAP */}
              <div className="flex flex-col gap-[6px] pr-3">
                <p
                  className="text-[11px] uppercase"
                  style={{ letterSpacing: "0.14em", color: "#7A7A7A" }}
                >
                  MCAP
                </p>
                <p
                  className="font-medium tabular-nums leading-none"
                  style={{
                    fontSize: "18px",
                    color: "#EDEDED",
                    fontWeight: 500,
                  }}
                >
                  <SolSymbol className="w-3 h-3 mr-1" />
                  {mktCap}
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: "rgba(122,122,122,0.7)" }}
                >
                  market cap
                </p>
              </div>

              {/* Divider */}
              <div
                className="flex flex-col gap-[6px] px-3"
                style={{
                  borderLeft: "1px solid rgba(255,255,255,0.06)",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p
                  className="text-[11px] uppercase"
                  style={{ letterSpacing: "0.14em", color: "#7A7A7A" }}
                >
                  SUPPLY
                </p>
                <p
                  className="font-medium tabular-nums leading-none"
                  style={{
                    fontSize: "18px",
                    color: "#EDEDED",
                    fontWeight: 500,
                  }}
                >
                  {album.editions_in_circulation}
                  <span
                    style={{ fontSize: "13px", color: "rgba(237,237,237,0.5)" }}
                  >
                    {" "}
                    / {album.total_supply}
                  </span>
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: "rgba(122,122,122,0.7)" }}
                >
                  circulating
                </p>
              </div>

              {/* TXNS */}
              <div className="flex flex-col gap-[6px] pl-3">
                <p
                  className="text-[11px] uppercase"
                  style={{ letterSpacing: "0.14em", color: "#7A7A7A" }}
                >
                  TXNS
                </p>
                <p
                  className="font-medium tabular-nums leading-none"
                  style={{
                    fontSize: "18px",
                    color: "#EDEDED",
                    fontWeight: 500,
                  }}
                >
                  {album.txns}
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: "rgba(122,122,122,0.7)" }}
                >
                  recent
                </p>
              </div>
            </div>

            {/* 24H change */}
            <p
              className="text-[11px] font-mono tabular-nums mt-3"
              style={{ color: changeColor }}
            >
              {positive ? "+" : ""}
              {album.change_24h_pct.toFixed(1)}% 24h
            </p>

            {/* VIEW ALBUM button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal();
              }}
              data-ocid={`discover.item.${index + 1}.button`}
              className="mt-auto pt-4 w-full text-[10px] uppercase tracking-widest text-center text-muted-foreground/60 border border-white/[0.1] rounded-lg py-2 hover:text-foreground/80 hover:border-white/20 transition-colors"
            >
              View Album
            </button>
          </div>
        </div>
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
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const { ownedAlbumIds, ownedEditions } = useWalletContext();

  // Map ta-01 / ta-02 → echo ids for owned checks
  const DISCOVER_ECHO_MAP: Record<string, string> = {
    "ta-01": "echo_001",
    "ta-02": "echo_002",
  };

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

      {/* ── Sort controls ── */}
      {!query.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="flex flex-wrap items-center justify-between gap-3 mb-5"
        >
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
          <span className="hidden sm:block w-px h-3 bg-white/10 shrink-0" />
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
        </motion.div>
      )}

      {/* ── Album cards grid ── */}
      {sortedAlbums.length === 0 ? (
        <p
          data-ocid="discover.empty_state"
          className="text-sm text-muted-foreground/30 py-10 text-center"
        >
          No albums found
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sortedAlbums.map((album, i) => {
            const echoId = DISCOVER_ECHO_MAP[album.id];
            const isOwned = echoId ? ownedAlbumIds.includes(echoId) : false;
            const ownedEdition = echoId
              ? (ownedEditions[echoId] ?? OWNED_EDITIONS[album.id])
              : undefined;
            return (
              <DiscoverAlbumCard
                key={album.id}
                album={album}
                isOwned={isOwned}
                ownedEdition={isOwned ? ownedEdition : undefined}
                onOpenModal={() => onAlbumClick(album.id)}
                index={i}
              />
            );
          })}
        </div>
      )}

      {/* ── Footer hint ── */}
      <p className="text-center text-[10px] text-muted-foreground/20 mt-8 font-mono">
        Tap card to flip · View Album to open detail
      </p>
    </div>
  );
}
