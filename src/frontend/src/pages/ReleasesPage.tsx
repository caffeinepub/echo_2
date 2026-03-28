import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { MintModal } from "../components/MintModal";
import { SolSymbol } from "../components/SolSymbol";
import { useWalletContext } from "../context/WalletContext";
import type { Song } from "../data/songs";
import { useMockData } from "../hooks/useMockData";

function useCountdown(targetMs: number | null) {
  const [remaining, setRemaining] = useState<number>(() => {
    if (targetMs === null) return 0;
    return targetMs;
  });

  useEffect(() => {
    if (targetMs === null) return;
    const end = Date.now() + targetMs;
    const interval = setInterval(() => {
      const left = Math.max(0, end - Date.now());
      setRemaining(left);
      if (left === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function statusText(song: Song, countdown: string): string {
  if (song.isSoldOut) return "Sold out";
  if (song.mintOpensInMs === 0 || song.mintOpensInMs === null)
    return "Live now";
  return `Releases in ${countdown}`;
}

function ReleaseTile({
  song,
  index,
  onSongClick,
  isOwned,
  onBuyClick,
}: {
  song: Song;
  index: number;
  onSongClick: (id: string) => void;
  isOwned: boolean;
  onBuyClick: (id: string) => void;
}) {
  const countdown = useCountdown(song.mintOpensInMs);
  const status = statusText(song, countdown);
  const live = !song.isSoldOut && song.mintOpensInMs === 0;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      data-ocid={`releases.item.${index + 1}`}
      onClick={() => onSongClick(song.id)}
      className="w-full text-left bg-card border border-border/40 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer"
    >
      {/* Square artwork */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={song.artworkSrc}
          alt={song.title}
          className="w-full h-full object-cover"
        />
        {song.isSoldOut && (
          <>
            <div className="absolute inset-0 bg-black/30" />
            <span className="absolute top-2 left-2 text-[9px] tracking-widest uppercase text-white/50 select-none">
              Sold Out
            </span>
          </>
        )}
        {live && !isOwned && (
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-400/70" />
        )}
      </div>

      {/* Info */}
      <div className="px-2 pt-2 pb-3">
        <p className="text-sm font-medium text-foreground truncate leading-snug">
          {song.title}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {song.artist}
        </p>
        <p className="text-[10px] text-muted-foreground/50 tracking-wide mt-1">
          {song.supply} Editions
        </p>
        {!song.isSoldOut && (
          <p className="text-xs font-mono text-foreground/70 mt-0.5 flex items-center gap-0">
            <SolSymbol animated={true} />
            {song.mintPrice}
          </p>
        )}
        <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">
          {status}
        </p>

        {live && (
          <div className="mt-2">
            {isOwned ? (
              <button
                type="button"
                className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground/60 font-medium"
              >
                Play Song
              </button>
            ) : (
              <button
                type="button"
                data-ocid={`releases.item.${index + 1}.button`}
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyClick(song.id);
                }}
                className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#7C3AED" }}
              >
                Buy
              </button>
            )}
          </div>
        )}
      </div>
    </motion.button>
  );
}

interface ReleasesPageProps {
  onAlbumClick: (albumId: string) => void;
}

export function ReleasesPage({ onAlbumClick }: ReleasesPageProps) {
  const { allAlbums } = useMockData();
  const { ownedAlbumIds } = useWalletContext();
  const [mintModalAlbumId, setMintModalAlbumId] = useState<string | null>(null);

  return (
    <div className="px-4 md:px-8 pt-8 pb-4">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-lg font-normal tracking-widest uppercase text-muted-foreground mb-6"
      >
        Releases
      </motion.h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {allAlbums.map((song, i) => (
          <ReleaseTile
            key={song.id}
            song={song}
            index={i}
            onSongClick={onAlbumClick}
            isOwned={ownedAlbumIds.includes(song.id)}
            onBuyClick={(id) => setMintModalAlbumId(id)}
          />
        ))}
      </div>

      {mintModalAlbumId && (
        <MintModal
          albumId={mintModalAlbumId}
          onClose={() => setMintModalAlbumId(null)}
        />
      )}
    </div>
  );
}
