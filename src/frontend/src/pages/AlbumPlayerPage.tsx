import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { MintModal } from "../components/MintModal";
import { SolSymbol } from "../components/SolSymbol";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import { useWalletContext } from "../context/WalletContext";
import { SONGS, formatEdition } from "../data/songs";

interface SongDetailPageProps {
  albumId: string;
  onBack: () => void;
}

// ─── Mock collector data per song ────────────────────────────────────────────
const SONG_COLLECTOR_DATA: Record<
  string,
  {
    currentListeners: number;
    playsLabel: string;
    recentActivity: {
      type: "purchase" | "listing" | "sale";
      description: string;
      time: string;
    }[];
    listings: { edition: string; price: number; seller: string }[];
  }
> = {
  echo_001: {
    currentListeners: 47,
    playsLabel: "142k plays",
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
    listings: [
      { edition: "#012", price: 2.9, seller: "7f3k...92x" },
      { edition: "#044", price: 3.1, seller: "mq9p...8ts" },
      { edition: "#007", price: 2.7, seller: "r4xb...2kz" },
      { edition: "#091", price: 3.4, seller: "w2nt...hf4" },
    ],
  },
  echo_002: {
    currentListeners: 31,
    playsLabel: "118k plays",
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
    listings: [
      { edition: "#003", price: 2.0, seller: "9pqr...44m" },
      { edition: "#018", price: 1.95, seller: "xk7z...91w" },
      { edition: "#055", price: 2.1, seller: "bn2q...7rs" },
    ],
  },
};

const ACTIVITY_DOT = {
  purchase: "bg-white/30",
  listing: "bg-white/20",
  sale: "bg-white/15",
};

// ─── ECHO SIGNAL Waveform ─────────────────────────────────────────────────────
const WAVE_BARS = Array.from({ length: 40 }, (_, i) => ({
  id: `wb${i}`,
  duration: 1.8 + ((i * 17) % 7) * 0.09,
  phase: (i * 0.13) % (1.8 + ((i * 17) % 7) * 0.09),
}));

function EchoSignalWaveform({ signalStrength }: { signalStrength: number }) {
  const active = signalStrength > 0;
  const amplitude = active ? 0.15 + signalStrength * 0.7 : 0;
  const minScale = active ? Math.max(0.04, 0.5 - amplitude) : 0.04;
  const maxScale = active ? Math.min(1, 0.5 + amplitude) : 0.04;

  return (
    <>
      <style>{`
        @keyframes echoWaveSong {
          0%, 100% { transform: scaleY(var(--min-scale)); }
          50%       { transform: scaleY(var(--max-scale)); }
        }
      `}</style>
      <div
        className="flex items-center justify-between w-full"
        style={{ height: 32 }}
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
                  ? `echoWaveSong ${duration}s ease-in-out ${-phase}s infinite`
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

// ─── Main page ────────────────────────────────────────────────────────────────
export function SongDetailPage({ albumId, onBack }: SongDetailPageProps) {
  const song = SONGS.find((s) => s.id === albumId);
  const { playPreview } = useAudioPlayer();
  const { ownedAlbumIds, getCirculatingSupply } = useWalletContext();
  const [showMintModal, setShowMintModal] = useState(false);

  if (!song) return null;

  const isOwned = ownedAlbumIds.includes(song.id);
  const collectorData = SONG_COLLECTOR_DATA[song.id];
  const circulatingSupply = getCirculatingSupply(song.id);
  const marketCap = (song.floorPrice * circulatingSupply).toFixed(1);

  function handleListen() {
    playPreview({
      id: song!.id,
      title: song!.title,
      artist: song!.artist,
      artworkSrc: song!.artworkSrc,
      preview_url: song!.preview_url,
    });
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
          data-ocid="song_detail.back.button"
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "oklch(0.45 0.008 240)" }}
        >
          <ArrowLeft size={15} />
          <span>Back</span>
        </motion.button>
      </div>

      {/* ── Cover Artwork ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex justify-center px-8 pt-4 pb-6"
      >
        <div
          className="relative rounded-2xl overflow-hidden w-full max-w-xs aspect-square"
          style={{
            boxShadow:
              "0 0 60px oklch(0.55 0.22 280 / 0.22), 0 16px 48px rgba(0,0,0,0.7)",
          }}
        >
          <img
            src={song.artworkSrc}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      {/* ── Song info ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="text-center px-5 mb-4"
      >
        <h1
          className="text-[24px] font-bold leading-tight"
          style={{ color: "oklch(0.96 0.005 220)" }}
        >
          {song.title}
        </h1>
        <p
          className="text-[15px] mt-1.5"
          style={{ color: "oklch(0.48 0.008 240)" }}
        >
          {song.artist}
        </p>
        {isOwned && (
          <span
            className="inline-block mt-2 text-[11px] font-mono px-2.5 py-0.5 rounded-full border"
            style={{
              borderColor: "oklch(0.55 0.22 280 / 0.35)",
              color: "oklch(0.72 0.15 280)",
              background: "oklch(0.55 0.22 280 / 0.08)",
            }}
          >
            {formatEdition(song.userEdition)} of {song.supply}
          </span>
        )}
        {!isOwned && (
          <span className="inline-block mt-2 text-[11px] font-mono text-muted-foreground/40">
            {song.supply} editions · {song.collectionName}
          </span>
        )}
      </motion.div>

      <div className="px-5 space-y-4 max-w-xl mx-auto">
        {/* ── Stats row ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.22 }}
          className="grid grid-cols-4 gap-2"
        >
          {[
            { label: "Market Cap", value: marketCap, sol: true },
            {
              label: "24H Volume",
              value: song.volume_24h_sol.toFixed(1),
              sol: true,
            },
            {
              label: "Supply",
              value: `${circulatingSupply}/${song.supply}`,
              sol: false,
            },
            { label: "Collectors", value: String(song.owners), sol: false },
          ].map(({ label, value, sol }) => (
            <div
              key={label}
              className="rounded-xl px-2 py-3 text-center"
              style={{
                background: "oklch(0.10 0.006 240)",
                border: "1px solid oklch(0.18 0.007 240)",
              }}
            >
              <p
                className="text-[9px] uppercase tracking-widest mb-1.5"
                style={{ color: "oklch(0.38 0.007 240)" }}
              >
                {label}
              </p>
              <p
                className="text-[13px] font-mono font-semibold tabular-nums flex items-center justify-center gap-0.5"
                style={{
                  color: sol ? "oklch(0.82 0.15 210)" : "oklch(0.88 0.005 220)",
                }}
              >
                {sol && <SolSymbol animated={true} />}
                {value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── ECHO SIGNAL ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.28 }}
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
          <EchoSignalWaveform signalStrength={song.signalStrength} />
          <p
            className="text-[12px] font-mono font-semibold mt-2"
            style={{ color: "oklch(0.82 0.15 210)" }}
          >
            {collectorData?.playsLabel ?? "—"}
          </p>
        </motion.div>

        {/* ── Action buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.34 }}
          className="flex gap-3"
        >
          <button
            type="button"
            onClick={handleListen}
            data-ocid="song_detail.secondary_button"
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all border"
            style={{
              borderColor: "oklch(0.28 0.008 240)",
              color: "oklch(0.75 0.005 240)",
              background: "transparent",
            }}
          >
            Listen 30s
          </button>
          {isOwned ? (
            <button
              type="button"
              data-ocid="song_detail.primary_button"
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{
                background: "oklch(0.35 0.01 240)",
                color: "oklch(0.82 0.005 240)",
              }}
            >
              Owned ✓
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowMintModal(true)}
              data-ocid="song_detail.primary_button"
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#7C3AED" }}
            >
              Collect ◎{song.mintPrice}
            </button>
          )}
        </motion.div>

        {/* ── Secondary market listings ── */}
        {collectorData?.listings && collectorData.listings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
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
            {collectorData.listings.map((listing, idx) => (
              <div
                key={listing.edition}
                data-ocid={`song_detail.row.${idx + 1}`}
                className="flex items-center gap-3 px-5 py-3.5 border-t group"
                style={{ borderColor: "oklch(0.14 0.006 240)" }}
              >
                <span
                  className="text-[12px] font-mono shrink-0"
                  style={{ color: "oklch(0.55 0.007 240)" }}
                >
                  {listing.edition}
                </span>
                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                  <SolSymbol animated={false} />
                  <span
                    className="text-[13px] font-mono font-medium"
                    style={{ color: "oklch(0.82 0.15 210)" }}
                  >
                    {listing.price}
                  </span>
                </div>
                <span
                  className="text-[11px] font-mono"
                  style={{ color: "oklch(0.38 0.007 240)" }}
                >
                  {listing.seller}
                </span>
                <button
                  type="button"
                  className="ml-1 shrink-0 text-[10px] font-mono border rounded-lg px-2 py-1 transition-all duration-150 opacity-0 group-hover:opacity-100"
                  style={{
                    borderColor: "oklch(0.25 0.007 240)",
                    color: "oklch(0.55 0.007 240)",
                  }}
                >
                  Buy
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Recent activity ── */}
        {collectorData?.recentActivity && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.46 }}
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
                Recent Activity
              </p>
            </div>
            {collectorData.recentActivity.map((item, idx) => (
              <div
                key={item.description}
                data-ocid={`song_detail.item.${idx + 1}`}
                className="flex items-center justify-between px-5 py-3 border-t"
                style={{ borderColor: "oklch(0.14 0.006 240)" }}
              >
                <div className="flex items-center gap-2.5 min-w-0 mr-3">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${ACTIVITY_DOT[item.type]}`}
                  />
                  <p
                    className="text-sm truncate"
                    style={{ color: "oklch(0.60 0.005 240)" }}
                  >
                    {item.description}
                  </p>
                </div>
                <span
                  className="text-[11px] font-mono shrink-0"
                  style={{ color: "oklch(0.35 0.006 240)" }}
                >
                  {item.time}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {showMintModal && (
        <MintModal albumId={song.id} onClose={() => setShowMintModal(false)} />
      )}
    </div>
  );
}

// Keep backward compat export name used in App.tsx
export { SongDetailPage as AlbumPlayerPage };
