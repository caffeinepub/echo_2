import {
  ArrowLeft,
  Lock,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { MintModal } from "../components/MintModal";
import { SolSymbol } from "../components/SolSymbol";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import { useWalletContext } from "../context/WalletContext";
import { ALBUMS, formatEdition } from "../data/albums";

interface AlbumPlayerPageProps {
  albumId: string;
  onBack: () => void;
}

// ─── Collector mock data ──────────────────────────────────────────────────────
const ALBUM_COLLECTOR_DATA: Record<
  string,
  {
    currentListeners: number;
    avgSessionMinutes: number;
    listenVolume: number;
    tradeFlow: { buyVolume: number; sellVolume: number };
    recentActivity: {
      type: "purchase" | "listing" | "sale";
      description: string;
      time: string;
    }[];
    trackPlays: { title: string; plays: string; rawCount: number }[];
    priceHistory: { "7D": number[]; "30D": number[]; All: number[] };
    stats: {
      supply: number;
      owners: number;
      floorPrice: string;
      lastSale: string;
    };
  }
> = {
  echo_001: {
    currentListeners: 47,
    avgSessionMinutes: 18,
    listenVolume: 0.72,
    tradeFlow: { buyVolume: 0.68, sellVolume: 0.41 },
    recentActivity: [
      {
        type: "purchase",
        description: "pale.moon bought #089 · ◎ 2.8",
        time: "5m ago",
      },
      {
        type: "listing",
        description: "orbit.nine listed #007 for ◎ 2.1",
        time: "11m ago",
      },
      { type: "sale", description: "#021 sold for ◎ 2.4", time: "44m ago" },
      {
        type: "purchase",
        description: "null_tide bought #042 · ◎ 2.6",
        time: "1h ago",
      },
    ],
    trackPlays: [
      { title: "Glass Wings", plays: "38k", rawCount: 38000 },
      { title: "Hollow Pulse", plays: "27k", rawCount: 27000 },
      { title: "Pale Echo", plays: "19k", rawCount: 19000 },
      { title: "Fade Protocol", plays: "15k", rawCount: 15000 },
    ],
    priceHistory: {
      "7D": [2.0, 2.1, 1.9, 2.2, 2.3, 2.1, 2.4],
      "30D": [
        1.8, 1.9, 2.0, 2.1, 1.9, 2.2, 2.3, 2.1, 2.4, 2.3, 2.5, 2.4, 2.6, 2.4,
        2.3, 2.5, 2.4, 2.6, 2.5, 2.7, 2.6, 2.4, 2.5, 2.6, 2.4, 2.5, 2.3, 2.4,
        2.5, 2.4,
      ],
      All: [
        1.2, 1.4, 1.6, 1.5, 1.7, 1.8, 1.6, 1.9, 2.0, 2.1, 1.9, 2.2, 2.3, 2.1,
        2.4, 2.3, 2.5, 2.4, 2.6,
      ],
    },
    stats: {
      supply: 150,
      owners: 89,
      floorPrice: "2.1",
      lastSale: "2.4",
    },
  },
  echo_002: {
    currentListeners: 31,
    avgSessionMinutes: 14,
    listenVolume: 0.55,
    tradeFlow: { buyVolume: 0.44, sellVolume: 0.29 },
    recentActivity: [
      {
        type: "listing",
        description: "wave.12 listed #003 for ◎ 1.8",
        time: "8m ago",
      },
      { type: "sale", description: "#011 sold for ◎ 1.7", time: "22m ago" },
      {
        type: "purchase",
        description: "drift.arc bought #055 · ◎ 1.9",
        time: "1h ago",
      },
    ],
    trackPlays: [
      { title: "Ember", plays: "31k", rawCount: 31000 },
      { title: "Ash", plays: "24k", rawCount: 24000 },
      { title: "Smoke Signal", plays: "17k", rawCount: 17000 },
      { title: "Drift", plays: "11k", rawCount: 11000 },
    ],
    priceHistory: {
      "7D": [1.5, 1.6, 1.7, 1.5, 1.6, 1.8, 1.7],
      "30D": [
        1.3, 1.4, 1.5, 1.6, 1.7, 1.5, 1.6, 1.8, 1.7, 1.9, 1.8, 1.7, 1.8, 1.8,
        1.7, 1.8, 1.9, 1.8, 1.7, 1.8, 1.6, 1.7, 1.8, 1.7, 1.8, 1.7, 1.6, 1.7,
        1.8, 1.7,
      ],
      All: [
        0.9, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.5, 1.6, 1.8, 1.7, 1.9, 1.8,
      ],
    },
    stats: {
      supply: 120,
      owners: 67,
      floorPrice: "1.7",
      lastSale: "1.8",
    },
  },
};

const ACTIVITY_DOT = {
  purchase: "bg-white/30",
  listing: "bg-white/20",
  sale: "bg-white/25",
};

const CURRENT_LISTINGS: Record<
  string,
  { edition: string; price: string; seller: string }[]
> = {
  echo_001: [
    { edition: "#021", price: "u25ce 2.4", seller: "echo_w...9k2" },
    { edition: "#042", price: "u25ce 2.6", seller: "null_t...4pz" },
    { edition: "#089", price: "u25ce 2.8", seller: "pale.m...3rf" },
    { edition: "#103", price: "u25ce 3.1", seller: "orbit....7hx" },
  ],
  echo_002: [
    { edition: "#003", price: "u25ce 1.8", seller: "wave.1...2mq" },
    { edition: "#017", price: "u25ce 1.9", seller: "drift....6nz" },
    { edition: "#055", price: "u25ce 2.1", seller: "halo.d...8vk" },
  ],
};

// ─── Price chart ──────────────────────────────────────────────────────────────
function PriceChart({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const W = 300;
  const H = 72;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 0.1;
  const pad = 4;
  const step = (W - pad * 2) / (data.length - 1);
  const points = data
    .map(
      (v, i) =>
        `${pad + i * step},${H - pad - ((v - min) / range) * (H - pad * 2)}`,
    )
    .join(" ");
  const trend = data[data.length - 1] >= data[0];
  const lineColor = trend ? "oklch(0.72 0.17 162)" : "oklch(0.62 0.18 25)";

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: H }}
        role="img"
        aria-label="Price history chart"
      >
        <polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
      </svg>
      <div className="flex justify-between mt-0.5">
        <span className="text-[9px] font-mono text-muted-foreground/30">
          {min.toFixed(1)}
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/30">
          {max.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

// ─── Collector panel ──────────────────────────────────────────────────────────
function CollectorPanel({
  data,
  albumId,
}: {
  data: (typeof ALBUM_COLLECTOR_DATA)[string];
  albumId: string;
}) {
  const [range, setRange] = useState<"7D" | "30D" | "All">("7D");
  const maxRawCount = Math.max(...data.trackPlays.map((t) => t.rawCount));
  const listings = CURRENT_LISTINGS[albumId] ?? [];

  return (
    <>
      <style>{`
        @keyframes echoListenPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.5); opacity: 0.35; }
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="max-w-sm mx-auto space-y-0"
      >
        {/* LISTEN FLOW */}
        <div className="py-5 border-t border-border/15">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-3 font-medium">
            Listen Flow
          </p>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: "rgba(74, 222, 128, 0.7)",
                animation: "echoListenPulse 2.5s ease-in-out infinite",
              }}
            />
            <span className="text-sm font-mono text-foreground/60">
              {data.currentListeners} listening now
            </span>
            <span className="text-[11px] font-mono text-muted-foreground/35 ml-1">
              · avg {data.avgSessionMinutes} min / session
            </span>
          </div>
          {/* Listen volume bar */}
          <div className="w-full h-[2px] rounded-full bg-white/5 mt-3">
            <div
              className="h-full rounded-full"
              style={{
                width: `${data.listenVolume * 100}%`,
                backgroundColor: "#E8E6E1",
                opacity: 0.45,
              }}
            />
          </div>
        </div>

        {/* TRADE FLOW */}
        <div className="py-5 border-t border-border/15">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-3 font-medium">
            Trade Flow
          </p>
          <div className="space-y-0">
            {/* BUY */}
            <div className="flex items-center gap-3 py-1.5">
              <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wider w-8 shrink-0">
                BUY
              </span>
              <div className="flex-1 h-[3px] rounded-full bg-white/5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${data.tradeFlow.buyVolume * 100}%`,
                    backgroundColor: "rgba(61, 220, 151, 0.35)",
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/30 w-8 text-right">
                {Math.round(data.tradeFlow.buyVolume * 100)}%
              </span>
            </div>
            {/* SELL */}
            <div className="flex items-center gap-3 py-1.5">
              <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wider w-8 shrink-0">
                SELL
              </span>
              <div className="flex-1 h-[3px] rounded-full bg-white/5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${data.tradeFlow.sellVolume * 100}%`,
                    backgroundColor: "rgba(255, 255, 255, 0.18)",
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/30 w-8 text-right">
                {Math.round(data.tradeFlow.sellVolume * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* CURRENT LISTINGS */}
        <div className="py-5 border-t border-border/15">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-3 font-medium">
            Current Listings
          </p>
          <div className="space-y-0">
            {listings.map((listing) => (
              <div
                key={listing.edition}
                className="flex items-center justify-between py-2 border-b border-border/10 last:border-0 group"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[11px] font-mono text-foreground/50 shrink-0">
                    {listing.edition}
                  </span>
                  <span className="text-[11px] font-mono text-foreground/70">
                    {listing.price}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground/35 truncate">
                    {listing.seller}
                  </span>
                </div>
                <button
                  type="button"
                  className="ml-3 shrink-0 text-[10px] font-mono text-muted-foreground/40 hover:text-foreground/70 border border-border/20 hover:border-border/50 rounded-lg px-2 py-1 transition-all duration-150 opacity-0 group-hover:opacity-100"
                >
                  Buy
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="py-5 border-t border-border/15">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-3 font-medium">
            Recent activity
          </p>
          <div className="space-y-0">
            {data.recentActivity.map((item) => (
              <div
                key={item.description}
                className="flex items-center justify-between py-2 border-b border-border/10 last:border-0"
              >
                <div className="flex items-center gap-2.5 min-w-0 mr-3">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${ACTIVITY_DOT[item.type]}`}
                  />
                  <p className="text-sm text-foreground/60 truncate">
                    {item.description}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground/30 shrink-0">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TRACK DOMINANCE */}
        <div className="py-5 border-t border-border/15">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-3 font-medium">
            Track Dominance
          </p>
          <div className="space-y-0">
            {data.trackPlays.map((t) => (
              <div
                key={t.title}
                className="flex items-center gap-3 py-2 border-b border-border/10 last:border-0"
              >
                <span className="text-sm text-foreground/60 w-28 shrink-0 truncate">
                  {t.title}
                </span>
                <div className="flex-1 h-[2px] rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(t.rawCount / maxRawCount) * 100}%`,
                      backgroundColor: "#E8E6E1",
                      opacity: 0.35,
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground/40 w-8 text-right shrink-0">
                  {t.plays}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price history */}
        <div className="py-5 border-t border-border/15">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium">
              Price history
            </p>
            <div className="flex items-center gap-3">
              {(["7D", "30D", "All"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  data-ocid="collector.tab"
                  className={`text-[10px] font-mono transition-all ${
                    range === r
                      ? "text-foreground/80 border-b border-foreground/30"
                      : "text-muted-foreground/30 hover:text-muted-foreground/50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <PriceChart data={data.priceHistory[range]} />
        </div>

        {/* Collection stats */}
        <div className="py-5 border-t border-border/15">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-4 font-medium">
            Collection stats
          </p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Supply", value: String(data.stats.supply) },
              { label: "Owners", value: String(data.stats.owners) },
              { label: "Floor", value: data.stats.floorPrice, sol: true },
              { label: "Last sale", value: data.stats.lastSale, sol: true },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground/30 mb-1 font-medium">
                  {s.label}
                </p>
                <p className="text-sm font-mono text-foreground/70">
                  {s.sol ? (
                    <>
                      <SolSymbol /> {s.value}
                    </>
                  ) : (
                    s.value
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* List edition */}
        <div className="py-5 border-t border-border/15">
          <button
            type="button"
            data-ocid="collector.primary_button"
            className="w-full py-3 rounded-xl border border-border/30 text-sm text-foreground/50 hover:text-foreground/80 hover:border-border/60 transition-all duration-200 font-medium tracking-wide"
          >
            List this edition
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function AlbumPlayerPage({ albumId, onBack }: AlbumPlayerPageProps) {
  const album = ALBUMS.find((a) => a.id === albumId);
  const { currentTrack, isPlaying, playLibrary, playPreview, pause, resume } =
    useAudioPlayer();
  const { ownedAlbumIds } = useWalletContext();

  const [activeTrack, setActiveTrack] = useState(0);
  const [progress, setProgress] = useState(0.3);
  const [isLooping, setIsLooping] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [showMintModal, setShowMintModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!album) return null;

  const isOwned = ownedAlbumIds.includes(album.id);
  const collectorData = ALBUM_COLLECTOR_DATA[album.id];
  const marketCap = (album.floorPrice * album.editions_in_circulation).toFixed(
    1,
  );
  const recentTxnCount = collectorData?.recentActivity.length ?? 0;

  function makeTrackId(index: number) {
    return `${album!.id}_track_${index}`;
  }

  const currentTrackId = makeTrackId(activeTrack);
  const isCurrentAlbumPlaying =
    currentTrack?.id === currentTrackId && isPlaying;
  const isCurrentAlbumActive = currentTrack?.id?.startsWith(album.id);

  function dispatchPlay(index: number) {
    if (isOwned) {
      playLibrary({
        id: makeTrackId(index),
        title: album!.tracks[index].title,
        artist: album!.artist,
        artworkSrc: album!.artworkSrc,
        preview_url: "",
      });
    } else {
      playPreview({
        id: makeTrackId(index),
        title: album!.tracks[index].title,
        artist: album!.artist,
        artworkSrc: album!.artworkSrc,
        preview_url: "",
      });
    }
  }

  function handlePrev() {
    const next = Math.max(0, activeTrack - 1);
    setActiveTrack(next);
    setProgress(0);
    if (isCurrentAlbumActive) dispatchPlay(next);
  }

  function handleNext() {
    const isLast = activeTrack === album!.tracks.length - 1;
    if (isLooping && isLast) {
      setProgress(0);
      dispatchPlay(activeTrack);
    } else {
      const next = Math.min(album!.tracks.length - 1, activeTrack + 1);
      setActiveTrack(next);
      setProgress(0);
      if (isCurrentAlbumActive) dispatchPlay(next);
    }
  }

  function handleTrackClick(index: number) {
    setActiveTrack(index);
    setProgress(0);
    dispatchPlay(index);
  }

  function handleMainPlayPause() {
    if (currentTrack?.id === currentTrackId) {
      isPlaying ? pause() : resume();
    } else {
      dispatchPlay(activeTrack);
    }
  }

  function handleScrub(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setProgress(Math.max(0, Math.min(1, x / rect.width)));
  }

  // Neutral waveform colors
  const playedBarColor = isLooping
    ? "rgba(237, 235, 230, 0.65)"
    : "rgba(232, 230, 225, 0.55)";

  const waveformBars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    height: 0.3 + 0.7 * Math.abs(Math.sin(i * 0.4 + 1.2) * Math.cos(i * 0.15)),
  }));

  return (
    <div className="px-6 md:px-12 pt-6 pb-4 min-h-screen">
      <motion.button
        type="button"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        data-ocid="player.back.button"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </motion.button>

      {/* Flip card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-8"
      >
        {/* 3D flip container */}
        <div
          style={{ perspective: "1200px" }}
          className="relative w-56 h-56 md:w-72 md:h-72"
        >
          <div
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
            className="relative w-full h-full"
          >
            {/* Front face */}
            <button
              type="button"
              style={{ backfaceVisibility: "hidden" }}
              className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden glow-mixed shadow-album cursor-pointer p-0 border-0"
              onClick={() => setIsFlipped(true)}
              data-ocid="player.canvas_target"
              aria-label="Flip to collector view"
            >
              <img
                src={album.artworkSrc}
                alt={album.title}
                className="w-full h-full object-cover"
              />
              {/* Preview badge overlay for non-owners */}
              {!isOwned && (
                <div className="absolute bottom-2 left-2">
                  <span className="text-[9px] tracking-widest uppercase text-white/50 font-mono">
                    Preview
                  </span>
                </div>
              )}
            </button>

            {/* Back face */}
            <button
              type="button"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden cursor-pointer bg-card border border-border/20 p-0"
              onClick={() => setIsFlipped(false)}
              aria-label="Flip back to album view"
            >
              {/* Subtle artwork blur layer */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url(${album.artworkSrc})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(12px)",
                }}
              />
              {/* Card back content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3 px-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/40 font-medium">
                  {album.id.replace("_", " ").toUpperCase()}
                </p>
                <p className="text-lg font-bold text-foreground/80">
                  {album.title}
                </p>
                <p className="text-[11px] text-muted-foreground/50 font-mono">
                  {formatEdition(album.userEdition)} of {album.supply}
                </p>
                <div className="mt-2 w-8 h-px bg-border/30" />
                <p className="text-[10px] text-muted-foreground/30 tracking-widest uppercase">
                  tap to close
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Flip hint */}
        <motion.p
          animate={{ opacity: showHint ? 0.35 : 0 }}
          transition={{ duration: 0.6 }}
          className="text-[10px] text-muted-foreground tracking-widest uppercase mt-3 pointer-events-none"
        >
          tap artwork to explore
        </motion.p>
      </motion.div>

      {/* Album meta */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          {album.title}
        </h1>
        <p className="text-muted-foreground text-sm mb-3">{album.artist}</p>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-card border border-border text-muted-foreground">
          {isOwned
            ? `${formatEdition(ownedAlbumIds.includes(album.id) ? album.editions_in_circulation + 1 : album.userEdition)} of ${album.supply}`
            : `${formatEdition(album.userEdition)} of ${album.supply}`}
        </span>
      </motion.div>

      {/* Header stat row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.22 }}
        className="flex items-center justify-center gap-8 mb-8"
      >
        <div className="text-center">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground/35 font-medium mb-0.5">
            MCap
          </p>
          <p className="text-sm font-mono text-foreground/70 tabular-nums">
            <SolSymbol className="inline-block w-3 h-3 opacity-60 mr-0.5" />{" "}
            {marketCap}
          </p>
        </div>
        <div className="w-px h-6 bg-border/20" />
        <div className="text-center">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground/35 font-medium mb-0.5">
            Supply
          </p>
          <p className="text-sm font-mono text-foreground/70 tabular-nums">
            {album.editions_in_circulation} / {album.supply}
          </p>
        </div>
        <div className="w-px h-6 bg-border/20" />
        <div className="text-center">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground/35 font-medium mb-0.5">
            Recent Txns
          </p>
          <p className="text-sm font-mono text-foreground/70 tabular-nums">
            {recentTxnCount}
          </p>
        </div>
      </motion.div>

      {/* Content — swaps based on flip state */}
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Player controls */}
            <div className="mb-8 max-w-sm mx-auto">
              <div
                role="slider"
                aria-label="Playback progress"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                tabIndex={0}
                className="relative h-10 flex items-center cursor-pointer mb-4 group"
                onClick={handleScrub}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight")
                    setProgress((p) => Math.min(1, p + 0.05));
                  if (e.key === "ArrowLeft")
                    setProgress((p) => Math.max(0, p - 0.05));
                }}
                data-ocid="player.canvas_target"
              >
                <div className="absolute inset-0 flex items-center gap-[2px] px-1 overflow-hidden">
                  {waveformBars.map(({ id, height }) => (
                    <div
                      key={id}
                      className="flex-1 rounded-full transition-colors"
                      style={{
                        height: `${Math.round(height * 100)}%`,
                        backgroundColor:
                          id / 60 <= progress
                            ? playedBarColor
                            : "oklch(var(--border))",
                      }}
                    />
                  ))}
                </div>
                {/* Scrub handle */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-10 group-hover:scale-110 transition-transform"
                  style={{
                    left: `calc(${progress * 100}% - 6px)`,
                    backgroundColor: "#C8C6C1",
                    opacity: 0.7,
                  }}
                />
              </div>

              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={handlePrev}
                  data-ocid="player.secondary_button"
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: "#7A7A7A" }}
                  aria-label="Previous track"
                >
                  <SkipBack size={22} />
                </button>
                <button
                  type="button"
                  onClick={handleMainPlayPause}
                  data-ocid="player.primary_button"
                  className="w-14 h-14 rounded-full flex items-center justify-center hover:opacity-85 transition-opacity shadow-lg"
                  style={{ backgroundColor: "#EDEBE6", color: "#0B0B0C" }}
                  aria-label={isCurrentAlbumPlaying ? "Pause" : "Play"}
                >
                  {isCurrentAlbumPlaying ? (
                    <Pause size={22} />
                  ) : (
                    <Play size={22} className="ml-0.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  data-ocid="player.secondary_button"
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: "#7A7A7A" }}
                  aria-label="Next track"
                >
                  <SkipForward size={22} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsLooping((l) => !l)}
                  data-ocid="player.toggle"
                  aria-label={isLooping ? "Disable loop" : "Enable loop"}
                  aria-pressed={isLooping}
                  className={`transition-all duration-200 ${
                    isLooping
                      ? "text-[#EDEBE6] bg-white/5 rounded-full p-1.5"
                      : "text-muted-foreground/40 hover:text-muted-foreground/70 p-1.5"
                  }`}
                >
                  <Repeat size={18} />
                </button>
              </div>
            </div>

            {/* Track list */}
            <div className="max-w-sm mx-auto">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Tracks
              </h2>
              <div className="space-y-1">
                {album.tracks.map((track, i) => {
                  const trackId = makeTrackId(i);
                  const isActive = currentTrack?.id === trackId;
                  const isThisPlaying = isActive && isPlaying;
                  return (
                    <button
                      type="button"
                      key={track.number}
                      onClick={() => handleTrackClick(i)}
                      data-ocid={`player.item.${track.number}`}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-left
                        ${
                          activeTrack === i
                            ? "bg-white/5 border border-white/10"
                            : "hover:bg-card border border-transparent"
                        }`}
                    >
                      <span
                        className={`w-5 text-xs text-right flex-shrink-0 ${
                          activeTrack === i
                            ? "text-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {isThisPlaying ? (
                          <span className="inline-flex gap-[2px] items-end h-4">
                            <span
                              className="w-[3px] bg-foreground/60 rounded-full animate-bounce"
                              style={{ height: "60%", animationDelay: "0ms" }}
                            />
                            <span
                              className="w-[3px] bg-foreground/60 rounded-full animate-bounce"
                              style={{
                                height: "100%",
                                animationDelay: "150ms",
                              }}
                            />
                            <span
                              className="w-[3px] bg-foreground/60 rounded-full animate-bounce"
                              style={{
                                height: "70%",
                                animationDelay: "300ms",
                              }}
                            />
                          </span>
                        ) : (
                          track.number
                        )}
                      </span>
                      <span
                        className={`flex-1 text-sm font-medium ${
                          activeTrack === i
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {track.title}
                      </span>
                      {/* Lock icon for non-owners */}
                      {!isOwned && (
                        <Lock
                          size={10}
                          className="text-muted-foreground/25 flex-shrink-0"
                        />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {track.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sticky buy banner for non-owners */}
            {!isOwned && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="max-w-sm mx-auto mt-8 mb-4"
              >
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/20"
                  style={{ backgroundColor: "oklch(0.12 0.005 265)" }}
                  data-ocid="player.panel"
                >
                  <span className="text-xs text-muted-foreground/60">
                    Full album
                    <span className="mx-1.5 text-muted-foreground/30">·</span>
                    <SolSymbol className="mr-0.5 opacity-60" />
                    <span className="font-mono">{album.mintPrice}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMintModal(true)}
                    data-ocid="player.primary_button"
                    className="text-xs font-medium text-white px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#7C3AED" }}
                  >
                    Buy Edition
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="back-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {collectorData ? (
              <CollectorPanel data={collectorData} albumId={album.id} />
            ) : (
              <p className="text-sm text-muted-foreground/40 text-center py-12">
                No collector data available.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mint modal */}
      {showMintModal && (
        <MintModal
          albumId={album.id}
          onClose={() => setShowMintModal(false)}
          onSuccess={() => setShowMintModal(false)}
        />
      )}
    </div>
  );
}
