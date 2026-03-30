import { Plus } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((left % 3600000) / 60000);
  return `${hours}h ${mins}m`;
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
      style={{
        height: "calc(100vh - 64px - 44px - 68px)",
        scrollSnapAlign: "start",
      }}
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

        {/* Mint count text */}
        <span className="text-[12px] font-mono text-white/50">
          {clip.mintedCount} / {clip.supply} minted
        </span>

        {/* Time remaining + mint button */}
        <div className="flex items-center justify-between gap-3">
          {remaining === "CLOSED" ? (
            <span className="text-[12px] font-mono font-medium text-red-400/80">
              CLOSED
            </span>
          ) : (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">
                Mint ending in
              </span>
              <span
                className={`text-[12px] font-mono font-medium ${
                  mintClosed ? "text-red-400/80" : "text-white/70"
                }`}
              >
                {remaining}
              </span>
            </div>
          )}

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
              {isSoldOut ? "Sold Out" : expired ? "Closed" : "Mint"}
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
  const [sortMode, setSortMode] = useState<"trending" | "new" | "minted">(
    "trending",
  );

  const sortedClips = useMemo(() => {
    const arr = [...clips];
    if (sortMode === "minted") {
      arr.sort((a, b) => b.mintedCount - a.mintedCount);
    } else {
      // trending and new both sort by newest
      arr.sort((a, b) => b.postedAt - a.postedAt);
    }
    return arr;
  }, [clips, sortMode]);

  const handleMintSuccess = useCallback(() => {
    setMintingClipId(null);
  }, []);

  // Suppress unused warning
  void solPrice;

  return (
    <div
      className="relative w-full"
      style={{ background: theme === "light" ? "#111" : "#000" }}
    >
      {/* Feed header row */}
      <div
        className="fixed top-16 left-0 right-0 z-30 flex items-center justify-end px-5 py-3 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
        }}
      >
        <button
          type="button"
          onClick={onRecord}
          data-ocid="releases.open_modal_button"
          className="pointer-events-auto w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-95"
          style={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Plus size={16} className="text-white/80" />
        </button>
      </div>

      {/* Sort filter bar */}
      <div
        className="fixed left-0 right-0 z-20 flex items-center justify-center px-5 py-2"
        style={{
          top: "64px",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 100%)",
        }}
      >
        <div
          className="flex rounded-full p-0.5"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {(["trending", "new", "minted"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSortMode(mode)}
              data-ocid={`releases.${mode}.tab`}
              className="px-4 py-1.5 rounded-full text-[12px] font-medium capitalize transition-all"
              style={
                sortMode === mode
                  ? {
                      background: "rgba(124,58,237,0.85)",
                      color: "white",
                      boxShadow: "0 0 12px rgba(124,58,237,0.4)",
                    }
                  : {
                      color: "rgba(255,255,255,0.5)",
                      background: "transparent",
                    }
              }
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable feed */}
      <div
        ref={feedRef}
        className="overflow-y-scroll"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          height: "calc(100vh - 64px - 44px - 68px)",
          marginTop: "calc(64px + 44px)",
        }}
      >
        {sortedClips.map((clip) => (
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
