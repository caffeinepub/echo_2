import { motion } from "motion/react";
import { useWalletContext } from "../context/WalletContext";
import { formatEdition } from "../data/songs";
import type { Song } from "../data/songs";
import { useMockData } from "../hooks/useMockData";

interface LibraryPageProps {
  onAlbumClick: (albumId: string) => void;
  onBrowseReleases?: () => void;
}

function SongCard({
  song,
  index,
  onClick,
}: { song: Song; index: number; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={onClick}
      data-ocid={`library.item.${index + 1}`}
      className="group text-left w-full focus:outline-none"
    >
      <div className="relative rounded-2xl overflow-hidden aspect-square mb-3">
        <img
          src={song.artworkSrc}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow:
              "inset 0 0 0 1px oklch(0.55 0.22 265 / 0.4), 0 0 40px 8px oklch(0.55 0.22 265 / 0.3), 0 0 80px 20px oklch(0.55 0.22 290 / 0.2)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="px-1">
        <p className="text-sm font-semibold text-foreground truncate">
          {song.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatEdition(song.userEdition)}
        </p>
      </div>
    </motion.button>
  );
}

export function LibraryPage({
  onAlbumClick,
  onBrowseReleases,
}: LibraryPageProps) {
  const { ownedAlbums } = useMockData();
  const { isConnected } = useWalletContext();

  return (
    <div className="px-6 md:px-12 pt-8 pb-4">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-2xl font-bold uppercase tracking-wider text-foreground mb-8"
      >
        Library
      </motion.h1>

      {!isConnected ? (
        <div
          data-ocid="library.empty_state"
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <p className="text-sm text-muted-foreground/60">
            Connect your wallet to see your collection.
          </p>
        </div>
      ) : ownedAlbums.length === 0 ? (
        <div
          data-ocid="library.empty_state"
          className="flex flex-col items-center justify-center py-24 text-center gap-3"
        >
          <p className="text-sm text-muted-foreground/60">No songs yet.</p>
          {onBrowseReleases && (
            <button
              type="button"
              onClick={onBrowseReleases}
              data-ocid="library.primary_button"
              className="text-xs text-muted-foreground/40 hover:text-foreground/60 transition-colors underline underline-offset-2"
            >
              Browse Releases to find your first drop.
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {ownedAlbums.map((song, i) => (
            <SongCard
              key={song.id}
              song={song}
              index={i}
              onClick={() => onAlbumClick(song.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
