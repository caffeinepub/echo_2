import { motion } from "motion/react";
import { formatEdition } from "../data/albums";
import type { Album } from "../data/albums";
import { useMockData } from "../hooks/useMockData";

interface LibraryPageProps {
  onAlbumClick: (albumId: string) => void;
}

function AlbumCard({
  album,
  index,
  onClick,
}: { album: Album; index: number; onClick: () => void }) {
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
          src={album.artworkSrc}
          alt={album.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Glow on hover */}
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
          {album.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatEdition(album.userEdition)}
        </p>
      </div>
    </motion.button>
  );
}

export function LibraryPage({ onAlbumClick }: LibraryPageProps) {
  const { ownedAlbums } = useMockData();

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

      {ownedAlbums.length === 0 ? (
        <div
          data-ocid="library.empty_state"
          className="flex flex-col items-center justify-center py-24 text-muted-foreground"
        >
          <p className="text-sm">No albums in your collection yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {ownedAlbums.map((album, i) => (
            <AlbumCard
              key={album.id}
              album={album}
              index={i}
              onClick={() => onAlbumClick(album.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
