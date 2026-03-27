import { ArrowLeft, Lock, Pause, Play } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { SolSymbol } from "../components/SolSymbol";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import { ALBUMS } from "../data/albums";

interface MarketDetailPageProps {
  albumId: string;
  onBack: () => void;
}

// ─── Local market data for all albums ────────────────────────────────────────
interface MarketAlbum {
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
  tracks: {
    number: number;
    title: string;
    duration: string;
    plays: number;
    preview_url: string;
  }[];
  listings: { edition: number; seller: string; price: number }[];
}

const MARKET_ALBUMS: MarketAlbum[] = [
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
    tracks: [
      {
        number: 1,
        title: "Glass Wings",
        duration: "3:42",
        plays: 38240,
        preview_url: "",
      },
      {
        number: 2,
        title: "Fade Protocol",
        duration: "4:11",
        plays: 29810,
        preview_url: "",
      },
      {
        number: 3,
        title: "Infrared",
        duration: "2:58",
        plays: 22100,
        preview_url: "",
      },
      {
        number: 4,
        title: "Hollow Pulse",
        duration: "5:03",
        plays: 18450,
        preview_url: "",
      },
      {
        number: 5,
        title: "Drift",
        duration: "3:27",
        plays: 14400,
        preview_url: "",
      },
    ],
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
    tracks: [
      {
        number: 1,
        title: "Ember",
        duration: "4:22",
        plays: 31200,
        preview_url: "",
      },
      {
        number: 2,
        title: "Smoke Signal",
        duration: "3:55",
        plays: 25800,
        preview_url: "",
      },
      {
        number: 3,
        title: "Ash",
        duration: "5:14",
        plays: 20100,
        preview_url: "",
      },
      {
        number: 4,
        title: "Residue",
        duration: "3:33",
        plays: 15300,
        preview_url: "",
      },
      {
        number: 5,
        title: "Kindling",
        duration: "4:01",
        plays: 11600,
        preview_url: "",
      },
    ],
    listings: [
      { edition: 3, seller: "9pqr...44m", price: 2.0 },
      { edition: 18, seller: "xk7z...91w", price: 1.95 },
      { edition: 55, seller: "bn2q...7rs", price: 2.1 },
    ],
  },
];

function getMarketAlbum(albumId: string): MarketAlbum {
  const found = MARKET_ALBUMS.find((a) => a.id === albumId);
  if (found) return found;
  return {
    id: albumId,
    title: albumId.replace("ta-", "Album "),
    artist: "Unknown Artist",
    artworkSrc: null,
    floor_price_sol: 1.0,
    total_supply: 100,
    circulating_supply: 40,
    transaction_volume: 2.5,
    listening_volume: 50000,
    change_24h_pct: 0,
    tracks: [
      {
        number: 1,
        title: "Track 1",
        duration: "3:30",
        plays: 12000,
        preview_url: "",
      },
      {
        number: 2,
        title: "Track 2",
        duration: "4:00",
        plays: 9800,
        preview_url: "",
      },
      {
        number: 3,
        title: "Track 3",
        duration: "3:15",
        plays: 7200,
        preview_url: "",
      },
    ],
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
  // amplitude: 0.15 at low, up to 0.85 at full
  const amplitude = active ? 0.12 + activityPct * 0.0073 : 0;
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
        {WAVE_BARS.map(({ id, duration, phase }) => {
          const delay = -phase;
          return (
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
                    ? `echoWave ${duration}s ease-in-out ${delay}s infinite`
                    : "none",
                  "--min-scale": minScale,
                  "--max-scale": maxScale,
                  transform: active ? undefined : `scaleY(${minScale})`,
                  transition: "transform 600ms ease, box-shadow 600ms ease",
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>
    </>
  );
}

// ─── Echo Signal Card ────────────────────────────────────────────────────────
function VolumeSignalCard({ album }: { album: MarketAlbum }) {
  const listeningPct = Math.min(
    100,
    (album.listening_volume / 10000 / 14.2) * 100,
  );

  return (
    <div
      className="rounded-2xl px-5 py-5"
      style={{
        background: "oklch(0.10 0.006 240)",
        border: "1px solid oklch(0.18 0.007 240)",
        boxShadow: "0 0 18px oklch(0.55 0.12 210 / 0.12)",
      }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-4"
        style={{ color: "oklch(0.45 0.008 240)" }}
      >
        ECHO SIGNAL
      </p>
      <SoundwaveVisualizer activityPct={listeningPct} />
      <p
        className="text-[12px] font-mono font-semibold mt-2"
        style={{ color: "oklch(0.82 0.15 210)" }}
      >
        142k plays
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function MarketDetailPage({ albumId, onBack }: MarketDetailPageProps) {
  const album = getMarketAlbum(albumId);
  const libAlbum = ALBUMS.find((a) => a.id === albumId);
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);
  const [playCounts, setPlayCounts] = useState<number[]>(
    album.tracks.map((t) => t.plays),
  );
  const { currentTrack, isPlaying, play, stop } = useAudioPlayer();
  const isPlayingAlbum = currentTrack?.id === `${albumId}-art` && isPlaying;

  const mktCap = album.floor_price_sol * album.circulating_supply;
  const positive = album.change_24h_pct >= 0;

  // Live play count pulse (every 30s)
  useEffect(() => {
    const timer = setInterval(() => {
      const idx = Math.floor(Math.random() * album.tracks.length);
      setPlayCounts((prev) => {
        const next = [...prev];
        next[idx] = next[idx] + Math.floor(Math.random() * 30 + 5);
        return next;
      });
      setPlayingTrack(idx);
      setTimeout(() => setPlayingTrack(null), 1200);
    }, 30000);
    return () => clearInterval(timer);
  }, [album.tracks.length]);

  function toggleArtPlay() {
    if (isPlayingAlbum) {
      stop();
    } else {
      play({
        id: `${albumId}-art`,
        title: album.tracks[0]?.title ?? album.title,
        artist: album.artist,
        artworkSrc: album.artworkSrc,
        preview_url: album.tracks[0]?.preview_url ?? "",
      });
    }
  }

  function handleTrackPreview(trackIdx: number) {
    const track = album.tracks[trackIdx];
    const tid = `${albumId}-track-${trackIdx}`;
    if (currentTrack?.id === tid && isPlaying) {
      stop();
    } else {
      play({
        id: tid,
        title: track.title,
        artist: album.artist,
        artworkSrc: album.artworkSrc,
        preview_url: track.preview_url,
      });
    }
  }

  return (
    <div
      className="min-h-screen pb-32"
      style={{ background: "oklch(0.07 0.005 240)" }}
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
          style={{ color: "oklch(0.45 0.008 240)" }}
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
          {isPlayingAlbum && (
            <div
              className="absolute inset-0 rounded-full animate-glow-pulse"
              style={{
                boxShadow:
                  "0 0 0 3px oklch(0.55 0.25 290 / 0.7), 0 0 30px oklch(0.55 0.25 290 / 0.3), 0 0 60px oklch(0.55 0.25 290 / 0.1)",
              }}
            />
          )}
          <div
            className={`w-full h-full rounded-full overflow-hidden ${
              isPlayingAlbum ? "animate-spin-slow" : ""
            }`}
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}
          >
            {album.artworkSrc ? (
              <img
                src={album.artworkSrc}
                alt={album.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.18 0.007 240), oklch(0.12 0.006 240))",
                }}
              />
            )}
          </div>
          <button
            type="button"
            onClick={toggleArtPlay}
            data-ocid="market_detail.primary_button"
            className="absolute inset-0 rounded-full flex items-center justify-center transition-opacity"
            style={{ background: "oklch(0.05 0.003 240 / 0.55)" }}
            aria-label={isPlayingAlbum ? "Pause" : "Preview"}
          >
            {isPlayingAlbum ? (
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
          style={{ color: "oklch(0.96 0.005 220)" }}
        >
          {album.title}
        </h1>
        <p
          className="text-[14px] mt-1"
          style={{ color: "oklch(0.45 0.008 240)" }}
        >
          {album.artist}
        </p>
        <p
          className="text-[11px] mt-1.5 uppercase tracking-widest"
          style={{ color: "oklch(0.35 0.006 240)" }}
        >
          {album.total_supply} editions · {albumId.toUpperCase()}
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
          {album.change_24h_pct.toFixed(1)}% 24H
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
                  <SolSymbol className="w-3.5 h-3.5" />
                  {mktCap.toFixed(1)}
                </span>
              ),
            },
            {
              label: "Total Supply",
              value: (
                <span style={{ color: "oklch(0.88 0.005 220)" }}>
                  {album.total_supply}
                </span>
              ),
            },
            {
              label: "Circulating",
              value: (
                <span style={{ color: "oklch(0.88 0.005 220)" }}>
                  {album.circulating_supply} / {album.total_supply}
                </span>
              ),
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl px-3 py-4 text-center"
              style={{
                background: "oklch(0.10 0.006 240)",
                border: "1px solid oklch(0.18 0.007 240)",
              }}
            >
              <p
                className="text-[9px] uppercase tracking-widest mb-2"
                style={{ color: "oklch(0.38 0.007 240)" }}
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
          <VolumeSignalCard album={album} />
        </motion.div>

        {/* ── Track list ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.34 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "oklch(0.10 0.006 240)",
            border: "1px solid oklch(0.18 0.007 240)",
          }}
        >
          <div className="px-5 pt-5 pb-3">
            <p
              className="text-[10px] uppercase tracking-[0.16em] font-semibold"
              style={{ color: "oklch(0.45 0.008 240)" }}
            >
              Tracks
            </p>
          </div>
          {album.tracks.map((track, idx) => {
            const tid = `${albumId}-track-${idx}`;
            const isTrackPlaying = currentTrack?.id === tid && isPlaying;
            const isPulsing = playingTrack === idx;
            const isOwned = libAlbum != null;

            return (
              <div
                key={track.number}
                data-ocid={`market_detail.item.${idx + 1}`}
                className="flex items-center gap-3 px-5 py-3 border-t"
                style={{ borderColor: "oklch(0.14 0.006 240)" }}
              >
                <span
                  className="text-[12px] font-mono w-5 shrink-0 text-right"
                  style={{ color: "oklch(0.35 0.006 240)" }}
                >
                  {track.number}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[13px] font-medium truncate"
                    style={{
                      color: isOwned
                        ? "oklch(0.90 0.005 220)"
                        : "oklch(0.55 0.007 240)",
                    }}
                  >
                    {track.title}
                  </p>
                  <p
                    className="text-[11px] font-mono mt-0.5"
                    style={{ color: "oklch(0.38 0.007 240)" }}
                  >
                    {track.duration}
                  </p>
                </div>
                <span
                  className={`text-[12px] font-mono tabular-nums shrink-0 ${
                    isPulsing ? "animate-value-flash" : ""
                  }`}
                  style={{
                    color: isPulsing
                      ? "oklch(0.82 0.15 210)"
                      : "oklch(0.42 0.008 240)",
                  }}
                >
                  {playCounts[idx] >= 1000
                    ? `${(playCounts[idx] / 1000).toFixed(1)}k`
                    : playCounts[idx]}
                </span>
                {isOwned ? (
                  <button
                    type="button"
                    onClick={() => handleTrackPreview(idx)}
                    className="w-8 h-8 flex items-center justify-center rounded-full shrink-0 transition-colors"
                    style={{ background: "oklch(0.14 0.006 240)" }}
                    aria-label={isTrackPlaying ? "Pause" : "Preview"}
                  >
                    {isTrackPlaying ? (
                      <Pause
                        className="w-3.5 h-3.5"
                        style={{ color: "oklch(0.55 0.25 290)" }}
                      />
                    ) : (
                      <Play
                        className="w-3.5 h-3.5 ml-0.5"
                        style={{ color: "oklch(0.55 0.25 290)" }}
                      />
                    )}
                  </button>
                ) : (
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-full shrink-0"
                    style={{ background: "oklch(0.13 0.006 240)" }}
                  >
                    <Lock
                      className="w-3 h-3"
                      style={{ color: "oklch(0.32 0.006 240)" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* ── Secondary market listings ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "oklch(0.10 0.006 240)",
            border: "1px solid oklch(0.18 0.007 240)",
          }}
        >
          <div className="px-5 pt-5 pb-3">
            <p
              className="text-[10px] uppercase tracking-[0.16em] font-semibold"
              style={{ color: "oklch(0.45 0.008 240)" }}
            >
              Listings
            </p>
          </div>
          {album.listings.map((listing, idx) => (
            <div
              key={`${listing.edition}-${listing.seller}`}
              data-ocid={`market_detail.row.${idx + 1}`}
              className="flex items-center gap-3 px-5 py-3.5 border-t"
              style={{ borderColor: "oklch(0.14 0.006 240)" }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-medium"
                  style={{ color: "oklch(0.78 0.005 220)" }}
                >
                  Edition #{String(listing.edition).padStart(3, "0")}
                </p>
                <p
                  className="text-[11px] font-mono mt-0.5"
                  style={{ color: "oklch(0.38 0.007 240)" }}
                >
                  {listing.seller}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-[15px] font-mono font-semibold flex items-center gap-1.5"
                  style={{ color: "oklch(0.82 0.15 210)" }}
                >
                  <SolSymbol className="w-3.5 h-3.5" />
                  {listing.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
