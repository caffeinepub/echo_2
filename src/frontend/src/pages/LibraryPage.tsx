import { ListPlus, Pause, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AnimatedCover } from "../components/AnimatedCover";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import { useWalletContext } from "../context/WalletContext";
import type { Song } from "../data/songs";
import { formatEdition } from "../data/songs";
import { useMockData } from "../hooks/useMockData";

interface LibraryPageProps {
  onAlbumClick: (albumId: string) => void;
  onBrowseReleases?: () => void;
}

function getStatusLabel(
  song: Song,
  currentTrackId: string | null,
  isLibraryPlaying: boolean,
  queueIds: string[],
  lastPlayedMap: Record<string, number>,
  isTopItem: boolean,
): { label: string; color: string } | null {
  if (currentTrackId === song.id && isLibraryPlaying) {
    return { label: "NOW PLAYING", color: "text-violet-400" };
  }
  if (queueIds.includes(song.id)) {
    return { label: "QUEUED", color: "text-cyan-400" };
  }
  if (isTopItem && lastPlayedMap[song.id]) {
    return { label: "RECENTLY PLAYED", color: "text-foreground/30" };
  }
  return null;
}

function SongCard({
  song,
  index,
  onPlay,
  onQueue,
  status,
  isCurrentlyPlaying,
  isSelected,
  onSelect,
  isAnimating,
  onToggleAnimate,
}: {
  song: Song;
  index: number;
  onPlay: () => void;
  onQueue: () => void;
  status: { label: string; color: string } | null;
  isCurrentlyPlaying: boolean;
  isSelected: boolean;
  onSelect: () => void;
  isAnimating: boolean;
  onToggleAnimate: () => void;
}) {
  function handleArtworkActivate(e: React.SyntheticEvent) {
    e.stopPropagation();
    onToggleAnimate();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.07, 0.4) }}
      data-ocid={`library.item.${index + 1}`}
      className="flex flex-col cursor-pointer"
      onClick={onSelect}
    >
      {/* Status label */}
      <div className="h-5 mb-1 px-0.5">
        {status && (
          <span
            className={`text-[9px] uppercase tracking-widest font-medium ${status.color}`}
          >
            {status.label}
          </span>
        )}
      </div>

      {/* Artwork — tap to animate */}
      <button
        type="button"
        aria-label={isAnimating ? "Stop animation" : "Animate artwork"}
        className={`relative rounded-xl overflow-hidden aspect-square w-full p-0 border-0 bg-transparent${isCurrentlyPlaying ? " echo-ra-glow" : ""}`}
        onClick={handleArtworkActivate}
        style={{
          transition: "box-shadow 0.4s ease, transform 0.3s ease",
          boxShadow: isAnimating
            ? "0 0 0 2px rgba(139,92,246,0.7), 0 0 24px rgba(139,92,246,0.5), 0 0 48px rgba(6,182,212,0.25)"
            : undefined,
          transform: isAnimating ? "scale(1.03)" : "scale(1)",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            animation: isAnimating
              ? "artReveal 0.4s ease-out forwards"
              : "none",
          }}
        >
          <AnimatedCover
            coverImage={song.artworkSrc}
            coverMotion={song.coverMotion}
            motionEnabled={song.motionEnabled}
            animate={isAnimating}
            alt={song.title}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Animated indicator overlay */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              key="anim-indicator"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full"
              style={{
                background: "rgba(139,92,246,0.7)",
                boxShadow: "0 0 10px rgba(139,92,246,0.6)",
                backdropFilter: "blur(4px)",
              }}
            >
              <span
                className="text-white text-[10px] font-bold"
                style={{ animation: "glow-pulse 1.6s ease-in-out infinite" }}
              >
                ◈
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsing ring when animating */}
        {isAnimating && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              border: "1.5px solid rgba(139,92,246,0.4)",
              animation: "artRingPulse 2s ease-in-out infinite",
            }}
          />
        )}
      </button>

      {/* Info */}
      <div className="mt-2 px-0.5">
        <p className="text-[13px] font-semibold text-foreground/90 truncate leading-tight">
          {song.title}
        </p>
        {!isSelected && (
          <p className="text-[11px] text-muted-foreground/40 mt-0.5">
            {formatEdition(song.userEdition)}
          </p>
        )}
      </div>

      {/* Edition badge — shown when card is selected and user owns an edition */}
      <AnimatePresence>
        {isSelected && song.userEdition > 0 && (
          <motion.div
            key="edition-badge"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-2 px-0.5"
          >
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border text-[9px] font-medium uppercase tracking-[0.18em] select-none bg-[#F8F9FC] border-[#E7EAF1] text-[#1A1A2E] dark:bg-white/[0.05] dark:border-white/[0.12] dark:text-white/60"
              style={{ boxShadow: "var(--edition-badge-glow, none)" }}
            >
              ECHO EDITION {String(song.userEdition).padStart(3, "0")} /{" "}
              {song.supply}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-2.5 px-0.5">
        <button
          type="button"
          data-ocid={`library.primary_button.${index + 1}`}
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          aria-label={isCurrentlyPlaying ? "Pause" : "Play"}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-violet-500/20 border border-white/[0.06] hover:border-violet-500/30 transition-all duration-200"
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-3.5 h-3.5 text-violet-400" />
          ) : (
            <Play className="w-3.5 h-3.5 text-foreground/60" />
          )}
        </button>

        <button
          type="button"
          data-ocid={`library.secondary_button.${index + 1}`}
          onClick={(e) => {
            e.stopPropagation();
            onQueue();
          }}
          aria-label="Add to queue"
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-cyan-500/10 border border-white/[0.04] hover:border-cyan-500/20 transition-all duration-200"
        >
          <ListPlus className="w-3.5 h-3.5 text-foreground/40" />
        </button>
      </div>
    </motion.div>
  );
}

export function LibraryPage({
  onAlbumClick: _onAlbumClick,
  onBrowseReleases,
}: LibraryPageProps) {
  const { ownedAlbums } = useMockData();
  const { isConnected } = useWalletContext();
  const audioPlayer = useAudioPlayer();

  const [lastPlayedMap, setLastPlayedMap] = useState<Record<string, number>>(
    {},
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const queueIds = audioPlayer.queue.map((t) => t.id);
  const isLibraryPlaying =
    audioPlayer.isPlaying && audioPlayer.currentTrack?.mode === "library";

  // Sort by most recently played descending; unplayed go to bottom
  const sortedSongs = [...ownedAlbums].sort((a, b) => {
    const ta = lastPlayedMap[a.id] ?? 0;
    const tb = lastPlayedMap[b.id] ?? 0;
    return tb - ta;
  });

  function handlePlay(song: Song) {
    audioPlayer.playLibrary({
      id: song.id,
      title: song.title,
      artist: song.artist,
      artworkSrc: song.artworkSrc,
      preview_url: song.preview_url,
    });
    setLastPlayedMap((prev) => ({ ...prev, [song.id]: Date.now() }));
  }

  function handleQueue(song: Song) {
    audioPlayer.addToQueue({
      id: song.id,
      title: song.title,
      artist: song.artist,
      artworkSrc: song.artworkSrc,
      preview_url: song.preview_url,
    });
  }

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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {sortedSongs.map((song, i) => {
            const isCurrentlyPlaying =
              audioPlayer.currentTrack?.id === song.id && isLibraryPlaying;
            const status = getStatusLabel(
              song,
              audioPlayer.currentTrack?.id ?? null,
              isLibraryPlaying,
              queueIds,
              lastPlayedMap,
              i === 0,
            );
            return (
              <SongCard
                key={song.id}
                song={song}
                index={i}
                onPlay={() => handlePlay(song)}
                onQueue={() => handleQueue(song)}
                status={status}
                isCurrentlyPlaying={isCurrentlyPlaying}
                isSelected={selectedId === song.id}
                onSelect={() =>
                  setSelectedId((prev) => (prev === song.id ? null : song.id))
                }
                isAnimating={animatingId === song.id}
                onToggleAnimate={() =>
                  setAnimatingId((prev) => (prev === song.id ? null : song.id))
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
