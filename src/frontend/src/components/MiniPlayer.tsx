import { Pause, Play, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useAudioPlayer } from "../context/AudioPlayerContext";

export function MiniPlayer() {
  const { currentTrack, isPlaying, pause, resume, stop } = useAudioPlayer();

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          key="mini-player"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 32 }}
          data-ocid="mini_player.panel"
          className="fixed bottom-[68px] left-0 right-0 z-40 bg-[#111111]/95 backdrop-blur-xl border-t border-white/[0.06]"
        >
          <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
            {/* Artwork */}
            <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-white/[0.08]">
              {currentTrack.artworkSrc ? (
                <img
                  src={currentTrack.artworkSrc}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full" />
              )}
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0 transition-all duration-200">
              <div className="flex items-baseline gap-1.5">
                <p className="text-sm text-foreground/90 truncate leading-tight">
                  {currentTrack.title}
                </p>
                {currentTrack.mode === "preview" && (
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground/30 font-medium shrink-0">
                    Preview
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground/45 truncate mt-0.5">
                {currentTrack.artist}
              </p>
            </div>

            {/* Play/Pause */}
            <button
              type="button"
              data-ocid="mini_player.toggle"
              onClick={() => (isPlaying ? pause() : resume())}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/[0.06] transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-foreground/80" />
              ) : (
                <Play className="w-5 h-5 text-foreground/80" />
              )}
            </button>

            {/* Close */}
            <button
              type="button"
              data-ocid="mini_player.close_button"
              onClick={stop}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/[0.06] transition-colors"
              aria-label="Close player"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground/30" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
