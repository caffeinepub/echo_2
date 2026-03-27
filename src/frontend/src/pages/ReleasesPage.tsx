import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Album } from "../data/albums";
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

function statusText(album: Album, countdown: string): string {
  if (album.isSoldOut) return "Sold out";
  if (!album.mintOpensInMs || album.mintOpensInMs === 0) return "Live now";
  return `Releases in ${countdown}`;
}

function ReleaseTile({
  album,
  index,
  onAlbumClick,
}: {
  album: Album;
  index: number;
  onAlbumClick: (id: string) => void;
}) {
  const countdown = useCountdown(album.mintOpensInMs);
  const status = statusText(album, countdown);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      data-ocid={`releases.item.${index + 1}`}
      onClick={() => onAlbumClick(album.id)}
      className="w-full text-left bg-card border border-border/40 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer"
    >
      {/* Square artwork */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={album.artworkSrc}
          alt={album.title}
          className="w-full h-full object-cover"
        />
        {album.isSoldOut && (
          <>
            <div className="absolute inset-0 bg-black/30" />
            <span className="absolute top-2 left-2 text-[9px] tracking-widest uppercase text-white/50 select-none">
              Sold Out
            </span>
          </>
        )}
      </div>

      {/* Info */}
      <div className="px-2 pt-2 pb-3">
        <p className="text-sm font-medium text-foreground truncate leading-snug">
          {album.title}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {album.artist}
        </p>
        <p className="text-[10px] text-muted-foreground/50 tracking-wide mt-1">
          {album.supply} Editions
        </p>
        <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">
          {status}
        </p>
      </div>
    </motion.button>
  );
}

interface ReleasesPageProps {
  onAlbumClick: (albumId: string) => void;
}

export function ReleasesPage({ onAlbumClick }: ReleasesPageProps) {
  const { allAlbums } = useMockData();

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
        {allAlbums.map((album, i) => (
          <ReleaseTile
            key={album.id}
            album={album}
            index={i}
            onAlbumClick={onAlbumClick}
          />
        ))}
      </div>
    </div>
  );
}
