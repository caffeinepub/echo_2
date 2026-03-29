import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import { MintModal } from "../components/MintModal";
import { useClipsContext } from "../context/ClipsContext";
import { useSolPriceContext } from "../contexts/SolPriceContext";
import type { Clip } from "../data/clips";

interface ReleasesPageProps {
  onAlbumClick?: (albumId: string) => void;
  onRecord: () => void;
}

function timeRemaining(clip: Clip): string {
  const left = clip.postedAt + clip.mintWindowMs - Date.now();
  if (left <= 0) return "CLOSED";
  const days = Math.floor(left / 86400000);
  const hours = Math.floor((left % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;
  const mins = Math.floor((left % 3600000) / 60000);
  return `${hours}h ${mins}m left`;
}

function MintProgress({ minted, supply }: { minted: number; supply: number }) {
  const pct = Math.min(100, (minted / supply) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-[2px] rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-[11px] font-mono text-white/70 whitespace-nowrap">
        {minted} / {supply}
      </span>
    </div>
  );
}

function ClipCard({
  clip,
  onMint,
}: {
  clip: Clip;
  onMint: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isOwned, isExpired } = useClipsContext();
  const owned = isOwned(clip.id);
  const expired = isExpired(clip);
  const isSoldOut = clip.mintedCount >= clip.supply;
  const mintClosed = expired || isSoldOut;
  const remaining = timeRemaining(clip);

  // IntersectionObserver — autoplay/pause as card enters/leaves viewport
  useEffect(() => {
    const el = containerRef.current;
    const vid = videoRef.current;
    if (!el || !vid) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full flex-shrink-0 overflow-hidden bg-black"
      style={{ height: "calc(100vh - 64px - 68px)", scrollSnapAlign: "start" }}
      data-ocid={`releases.item.${clip.id}`}
    >
      {/* Background video */}
      <video
        ref={videoRef}
        src={clip.videoUrl}
        poster={clip.thumbnailUrl}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectFit: "cover" }}
      />

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "65%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)",
        }}
      />

      {/* Content overlay */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-6 flex flex-col gap-3">
        {/* Creator & caption */}
        <div>
          <p className="text-white font-semibold text-[15px] leading-tight drop-shadow">
            {clip.creatorName}
          </p>
          {clip.caption && (
            <p className="text-white/80 text-[13px] mt-0.5 leading-snug drop-shadow">
              {clip.caption}
            </p>
          )}
        </div>

        {/* Mint progress */}
        <MintProgress minted={clip.mintedCount} supply={clip.supply} />

        {/* Time remaining + mint button */}
        <div className="flex items-center justify-between gap-3">
          <span
            className={`text-[12px] font-mono font-medium ${
              mintClosed ? "text-red-400/80" : "text-white/60"
            }`}
          >
            {remaining}
          </span>

          {owned ? (
            <span
              className="px-4 py-2 rounded-full text-[12px] font-medium text-violet-300 border border-violet-400/40"
              style={{
                backdropFilter: "blur(8px)",
                backgroundColor: "rgba(124,58,237,0.15)",
              }}
            >
              Owned
            </span>
          ) : (
            <button
              type="button"
              disabled={mintClosed}
              onClick={onMint}
              data-ocid="releases.primary_button"
              className="px-5 py-2 rounded-full text-[13px] font-semibold text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: mintClosed
                  ? "rgba(255,255,255,0.1)"
                  : "linear-gradient(135deg, #7c3aed, #a855f7)",
                boxShadow: mintClosed
                  ? "none"
                  : "0 0 20px rgba(124,58,237,0.5)",
              }}
            >
              {isSoldOut ? "Sold Out" : expired ? "Closed" : "Mint for $5"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReleasesPage({ onRecord }: ReleasesPageProps) {
  const { clips } = useClipsContext();
  const { solPrice } = useSolPriceContext();
  const { theme } = useTheme();
  const feedRef = useRef<HTMLDivElement>(null);
  const [mintingClipId, setMintingClipId] = useState<string | null>(null);

  const handleMintSuccess = useCallback(() => {
    setMintingClipId(null);
  }, []);

  return (
    <div
      className="relative w-full"
      style={{ background: theme === "light" ? "#111" : "#000" }}
    >
      {/* Feed header */}
      <div
        className="fixed top-16 left-0 right-0 z-30 flex items-center justify-between px-5 py-3 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
        }}
      >
        <span
          className="text-white font-bold tracking-[0.2em] text-[13px] uppercase pointer-events-auto"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          ECHO CLIPS
        </span>
        <button
          type="button"
          onClick={onRecord}
          data-ocid="releases.open_modal_button"
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white transition-all active:scale-95"
          style={{
            background: "rgba(220,38,38,0.9)",
            boxShadow: "0 0 12px rgba(220,38,38,0.5)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          REC
        </button>
      </div>

      {/* Scrollable feed */}
      <div
        ref={feedRef}
        className="overflow-y-scroll"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          height: "calc(100vh - 64px - 68px)",
        }}
      >
        {clips.map((clip) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            onMint={() => setMintingClipId(clip.id)}
          />
        ))}
      </div>

      {/* Mint modal */}
      <AnimatePresence>
        {mintingClipId && (
          <MintModal
            albumId=""
            clipId={mintingClipId}
            onClose={() => setMintingClipId(null)}
            onSuccess={handleMintSuccess}
            solPrice={solPrice}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
