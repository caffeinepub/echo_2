import { ArrowLeft, Lock, Pause, Play } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { SolSymbol } from "../components/SolSymbol";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import { SONGS } from "../data/songs";

interface MarketDetailPageProps {
  albumId: string;
  onBack: () => void;
}

// ─── Local market data for all songs ─────────────────────────────────────────
interface MarketSong {
  id: string;
  title: string;
  artist: string;
  artworkSrc: string | null;
  floor_price_sol: number;
  total_supply: number;
  circulating_supply: number;
  transaction_volume: number;
  listening_volume: number;
  change_24h_pct: number;
  listings: { edition: number; seller: string; price: number }[];
}

const MARKET_SONGS: MarketSong[] = [
  {
    id: "echo_001",
    title: "Fragments",
    artist: "Halo Drift",
    artworkSrc: "/assets/generated/album-fragments.dim_600x600.jpg",
    floor_price_sol: 2.6,
    total_supply: 150,
    circulating_supply: 89,
    transaction_volume: 18.4,
    listening_volume: 142000,
    change_24h_pct: 12.2,
    listings: [
      { edition: 12, seller: "7f3k...92x", price: 2.9 },
      { edition: 44, seller: "mq9p...8ts", price: 3.1 },
      { edition: 7, seller: "r4xb...2kz", price: 2.7 },
      { edition: 91, seller: "w2nt...hf4", price: 3.4 },
    ],
  },
  {
    id: "echo_002",
    title: "Charcoal",
    artist: "Vessel",
    artworkSrc: "/assets/generated/album-charcoal.dim_600x600.jpg",
    floor_price_sol: 1.8,
    total_supply: 120,
    circulating_supply: 61,
    transaction_volume: 7.8,
    listening_volume: 118000,
    change_24h_pct: 4.7,
    listings: [
      { edition: 3, seller: "9pqr...44m", price: 2.0 },
      { edition: 18, seller: "xk7z...91w", price: 1.95 },
      { edition: 55, seller: "bn2q...7rs", price: 2.1 },
    ],
  },
];

function getMarketSong(albumId: string): MarketSong {
  const found = MARKET_SONGS.find((s) => s.id === albumId);
  if (found) return found;
  return {
    id: albumId,
    title: albumId,
    artist: "Unknown Artist",
    artworkSrc: null,
    floor_price_sol: 1.0,
    total_supply: 100,
    circulating_supply: 40,
    transaction_volume: 2.5,
    listening_volume: 50000,
    change_24h_pct: 0,
    listings: [
      { edition: 5, seller: "4abc...11z", price: 1.1 },
      { edition: 21, seller: "8dfg...55w", price: 1.2 },
    ],
  };
}

// ─── Soundwave Visualizer ─────────────────────────────────────────────────────
const WAVE_BARS = Array.from({ length: 40 }, (_, i) => ({
  id: `wb${i}`,
  duration: 1.8 + ((i * 17) % 7) * 0.09,
  phase: (i * 0.13) % (1.8 + ((i * 17) % 7) * 0.09),
}));

function SoundwaveVisualizer({ activityPct }: { activityPct: number }) {
  const active = activityPct > 0;
  const amplitude = active ? 0.15 + (activityPct / 100) * 0.7 : 0;
  const minScale = active ? Math.max(0.04, 0.5 - amplitude) : 0.04;
  const maxScale = active ? Math.min(1, 0.5 + amplitude) : 0.04;

  return (
    <>
      <style>{`
        @keyframes echoWave {
          0%, 100% { transform: scaleY(var(--min-scale)); }
          50%       { transform: scaleY(var(--max-scale)); }
        }
      `}</style>
      <div
        className="flex items-center justify-between w-full"
        style={{ height: 28 }}
        aria-hidden="true"
      >
        {WAVE_BARS.map(({ id, duration, phase }) => (
          <div
            key={id}
            style={
              {
                width: 2,
                height: "100%",
                borderRadius: 1,
                background:
                  "linear-gradient(to bottom, oklch(0.75 0.18 210), oklch(0.55 0.22 280))",
                boxShadow: active
                  ? "0 0 4px oklch(0.75 0.18 210 / 0.5)"
                  : "none",
                transformOrigin: "center",
                animation: active
                  ? `echoWave ${duration}s ease-in-out ${-phase}s infinite`
                  : "none",
                "--min-scale": minScale,
                "--max-scale": maxScale,
                transform: active ? undefined : `scaleY(${minScale})`,
                transition: "transform 600ms ease, box-shadow 600ms ease",
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}

// ─── Echo Signal Card ────────────────────────────────────────────────────────
function VolumeSignalCard({ song }: { song: MarketSong }) {
  const listeningPct = Math.min(
    100,
    (song.listening_volume / 10000 / 14.2) * 100,
  );

  return (
    <div
      className="rounded-2xl px-5 py-5"
      style={{
        background: "var(--echo-surface)",
        border: "1px solid var(--echo-border)",
        boxShadow: "0 0 18px oklch(0.55 0.12 210 / 0.12)",
      }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-4"
        style={{ color: "var(--echo-text-secondary)" }}
      >
        ECHO SIGNAL
      </p>
      <SoundwaveVisualizer activityPct={listeningPct} />
      <p
        className="text-[12px] font-mono font-semibold mt-2"
        style={{ color: "oklch(0.82 0.15 210)" }}
      >
        {(song.listening_volume / 1000).toFixed(0)}k plays
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function MarketDetailPage({ albumId, onBack }: MarketDetailPageProps) {
  const song = getMarketSong(albumId);
  const libSong = SONGS.find((s) => s.id === albumId);
  const { currentTrack, isPlaying, play, stop } = useAudioPlayer();
  const [_unused] = useState(0);
  const isPlayingSong = currentTrack?.id === `${albumId}-art` && isPlaying;

  const mktCap = song.floor_price_sol * song.circulating_supply;
  const positive = song.change_24h_pct >= 0;

  function toggleArtPlay() {
    if (isPlayingSong) {
      stop();
    } else {
      play({
        id: `${albumId}-art`,
        title: song.title,
        artist: song.artist,
        artworkSrc: song.artworkSrc,
        preview_url: "",
      });
    }
  }

  return (
    <div
      className="min-h-screen pb-32"
      style={{ background: "var(--echo-bg)" }}
    >
      {/* Back button */}
      <div className="px-5 pt-5 pb-2">
        <motion.button
          type="button"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          data-ocid="market_detail.back.button"
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "var(--echo-text-secondary)" }}
        >
          <ArrowLeft size={15} />
          <span>Discover</span>
        </motion.button>
      </div>

      {/* ── Artwork ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex justify-center pt-6 pb-6 px-5"
      >
        <div className="relative" style={{ width: 160, height: 160 }}>
          {isPlayingSong && (
            <div
              className="absolute inset-0 rounded-full animate-glow-pulse"
              style={{
                boxShadow:
                  "0 0 0 3px oklch(0.55 0.25 290 / 0.7), 0 0 30px oklch(0.55 0.25 290 / 0.3), 0 0 60px oklch(0.55 0.25 290 / 0.1)",
              }}
            />
          )}
          <div
            className={`w-full h-full rounded-full overflow-hidden ${isPlayingSong ? "animate-spin-slow" : ""}`}
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}
          >
            {song.artworkSrc ? (
              <img
                src={song.artworkSrc}
                alt={song.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background:
                    "linear-gradient(135deg, var(--echo-border), var(--echo-surface-alt))",
                }}
              />
            )}
          </div>
          <button
            type="button"
            onClick={toggleArtPlay}
            data-ocid="market_detail.primary_button"
            className="absolute inset-0 rounded-full flex items-center justify-center transition-opacity"
            style={{ background: "var(--echo-bg)" }}
            aria-label={isPlayingSong ? "Pause" : "Preview"}
          >
            {isPlayingSong ? (
              <Pause className="w-8 h-8" style={{ color: "white" }} />
            ) : (
              <Play className="w-8 h-8 ml-1" style={{ color: "white" }} />
            )}
          </button>
        </div>
      </motion.div>

      {/* ── Title block ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
        className="text-center px-5 mb-1"
      >
        <h1
          className="text-[22px] font-bold leading-tight"
          style={{ color: "var(--echo-text)" }}
        >
          {song.title}
        </h1>
        <p
          className="text-[14px] mt-1"
          style={{ color: "var(--echo-text-secondary)" }}
        >
          {song.artist}
        </p>
        <p
          className="text-[11px] mt-1.5 uppercase tracking-widest"
          style={{ color: "var(--echo-text-dark)" }}
        >
          {song.total_supply} editions · {albumId.toUpperCase()}
        </p>
      </motion.div>

      {/* ── Change badge ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18 }}
        className="flex justify-center mt-3 mb-6"
      >
        <span
          className="px-3 py-1 rounded-full text-[12px] font-mono font-semibold"
          style={{
            background: positive
              ? "oklch(0.76 0.18 160 / 0.12)"
              : "oklch(0.65 0.22 10 / 0.12)",
            color: positive ? "oklch(0.76 0.18 160)" : "oklch(0.65 0.22 10)",
            border: `1px solid ${positive ? "oklch(0.76 0.18 160 / 0.25)" : "oklch(0.65 0.22 10 / 0.25)"}`,
            textShadow: positive
              ? "0 0 8px oklch(0.76 0.18 160 / 0.4)"
              : "0 0 8px oklch(0.65 0.22 10 / 0.4)",
          }}
        >
          {positive ? "+" : ""}
          {song.change_24h_pct.toFixed(1)}% 24H
        </span>
      </motion.div>

      <div className="px-5 space-y-5 max-w-xl mx-auto">
        {/* ── Market data grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="grid grid-cols-3 gap-2.5"
        >
          {[
            {
              label: "Market Cap",
              value: (
                <span
                  className="flex items-center gap-1.5 justify-center"
                  style={{ color: "oklch(0.82 0.15 210)" }}
                >
                  <SolSymbol large animated={true} />
                  {mktCap.toFixed(1)}
                </span>
              ),
            },
            {
              label: "Total Supply",
              value: (
                <span style={{ color: "var(--echo-text-dim)" }}>
                  {song.total_supply}
                </span>
              ),
            },
            {
              label: "Circulating",
              value: (
                <span style={{ color: "var(--echo-text-dim)" }}>
                  {song.circulating_supply} / {song.total_supply}
                </span>
              ),
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl px-3 py-4 text-center"
              style={{
                background: "var(--echo-surface)",
                border: "1px solid var(--echo-border)",
              }}
            >
              <p
                className="text-[9px] uppercase tracking-widest mb-2"
                style={{ color: "var(--echo-text-muted)" }}
              >
                {label}
              </p>
              <p className="text-[15px] font-mono font-semibold tabular-nums">
                {value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── Volume Signal ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.28 }}
        >
          <VolumeSignalCard song={song} />
        </motion.div>

        {/* ── Secondary market listings ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.34 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--echo-surface)",
            border: "1px solid var(--echo-border)",
          }}
        >
          <div className="px-5 pt-5 pb-3">
            <p
              className="text-[10px] uppercase tracking-[0.16em] font-semibold"
              style={{ color: "var(--echo-text-secondary)" }}
            >
              Listings
            </p>
          </div>
          {song.listings.map((listing, idx) => (
            <div
              key={`${listing.edition}-${listing.seller}`}
              data-ocid={`market_detail.row.${idx + 1}`}
              className="flex items-center gap-3 px-5 py-3.5 border-t"
              style={{ borderColor: "var(--echo-border-faint)" }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-medium"
                  style={{ color: "var(--echo-text-secondary)" }}
                >
                  #{String(listing.edition).padStart(3, "0")} · {listing.seller}
                </p>
              </div>
              <p
                className="text-[15px] font-mono font-semibold shrink-0 flex items-center gap-1"
                style={{ color: "oklch(0.82 0.15 210)" }}
              >
                <SolSymbol animated={true} />
                {listing.price}
              </p>
              <button
                type="button"
                className="shrink-0 text-[10px] font-mono border rounded-lg px-2 py-1 transition-all"
                style={{
                  borderColor: "var(--echo-border)",
                  color: "var(--echo-text-secondary)",
                }}
              >
                Buy
              </button>
            </div>
          ))}
        </motion.div>

        {/* ── Library info ── */}
        {libSong && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.4 }}
            className="rounded-2xl px-5 py-4"
            style={{
              background: "var(--echo-surface)",
              border: "1px solid var(--echo-border)",
            }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-3"
              style={{ color: "var(--echo-text-secondary)" }}
            >
              Song Info
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Floor",
                  value: libSong.floorPrice.toFixed(1),
                  sol: true,
                },
                {
                  label: "Last Sale",
                  value: libSong.lastSoldPrice.toFixed(1),
                  sol: true,
                },
                { label: "Owners", value: String(libSong.owners), sol: false },
                {
                  label: "Supply",
                  value: `${libSong.editions_in_circulation} / ${libSong.supply}`,
                  sol: false,
                },
              ].map((s) => (
                <div key={s.label}>
                  <p
                    className="text-[9px] uppercase tracking-widest mb-1"
                    style={{ color: "var(--echo-text-dark)" }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="text-sm font-mono"
                    style={{ color: "var(--echo-text-secondary)" }}
                  >
                    {s.sol ? (
                      <>
                        <SolSymbol animated={true} />
                        {s.value}
                      </>
                    ) : (
                      s.value
                    )}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
