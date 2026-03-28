import {
  Lock,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useAudioPlayer } from "../context/AudioPlayerContext";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    queue,
    loopMode,
    currentTime,
    duration,
    pause,
    resume,
    stop,
    skipNext,
    skipPrevious,
    setLoopMode,
    seek,
  } = useAudioPlayer();

  const isLibrary = currentTrack?.mode === "library";
  const isPreview = currentTrack?.mode === "preview";
  const previewProgress = Math.min((currentTime / 30) * 100, 100);
  const seekProgress = (currentTime / (duration || 1)) * 100;

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
          className="fixed bottom-[68px] left-0 right-0 z-40 backdrop-blur-xl border-t"
          style={{
            background: "var(--echo-surface)",
            borderColor: "var(--echo-border)",
            boxShadow: "0 -4px 24px oklch(0 0 0 / 0.08)",
          }}
        >
          {/* Main row */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-1.5 max-w-3xl mx-auto">
            {/* Artwork */}
            <div
              className="w-9 h-9 rounded-md overflow-hidden shrink-0"
              style={{ background: "var(--echo-elevated)" }}
            >
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
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <p
                  className="text-[13px] truncate leading-tight"
                  style={{ color: "var(--echo-text)" }}
                >
                  {currentTrack.title}
                </p>
                {isPreview && (
                  <span
                    className="flex items-center gap-0.5 text-[9px] uppercase tracking-widest font-medium shrink-0"
                    style={{ color: "var(--echo-text-dark)" }}
                  >
                    <Lock className="w-2 h-2 inline-block" />
                    Preview
                  </span>
                )}
              </div>
              <p
                className="text-[11px] truncate mt-0.5"
                style={{ color: "var(--echo-text-muted)" }}
              >
                {currentTrack.artist}
              </p>
              {isLibrary && queue.length > 0 && (
                <p className="text-[9px] uppercase tracking-widest text-cyan-400/40 mt-0.5">
                  +{queue.length} in queue
                </p>
              )}
            </div>

            {/* Skip back — library only */}
            {isLibrary && (
              <button
                type="button"
                data-ocid="mini_player.secondary_button"
                onClick={skipPrevious}
                className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
                style={{ color: "var(--echo-text-secondary)" }}
                aria-label="Previous"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Play/Pause */}
            <button
              type="button"
              data-ocid="mini_player.toggle"
              onClick={() => (isPlaying ? pause() : resume())}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
              style={{ color: "var(--echo-text)" }}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-[18px] h-[18px]" />
              ) : (
                <Play className="w-[18px] h-[18px]" />
              )}
            </button>

            {/* Skip forward + loop — library only */}
            {isLibrary && (
              <>
                <button
                  type="button"
                  data-ocid="mini_player.primary_button"
                  onClick={skipNext}
                  className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
                  style={{ color: "var(--echo-text-secondary)" }}
                  aria-label="Next"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  data-ocid="mini_player.toggle"
                  onClick={() =>
                    setLoopMode(loopMode === "off" ? "loop" : "off")
                  }
                  className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
                  aria-label={loopMode === "loop" ? "Loop on" : "Loop off"}
                >
                  <Repeat
                    className={`w-3.5 h-3.5 transition-colors ${
                      loopMode === "loop" ? "text-violet-400" : ""
                    }`}
                    style={
                      loopMode !== "loop"
                        ? { color: "var(--echo-text-dark)" }
                        : undefined
                    }
                  />
                </button>
              </>
            )}

            {/* Close */}
            <button
              type="button"
              data-ocid="mini_player.close_button"
              onClick={stop}
              className="w-6 h-6 flex items-center justify-center rounded-full transition-colors"
              style={{ color: "var(--echo-text-dark)" }}
              aria-label="Close player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress section */}
          <div className="px-4 pb-2.5 max-w-3xl mx-auto w-full">
            {isLibrary ? (
              /* Full scrub bar for owned tracks */
              <>
                <div className="flex justify-between mb-1">
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--echo-text-dark)" }}
                  >
                    {formatTime(currentTime)}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--echo-text-dark)" }}
                  >
                    {formatTime(duration)}
                  </span>
                </div>
                <div className="relative flex items-center py-2.5 -my-2.5">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    step={0.1}
                    onChange={(e) => seek(Number(e.target.value))}
                    aria-label="Seek"
                    data-ocid="mini_player.drag_handle"
                    className="w-full h-0.5 rounded-full appearance-none cursor-pointer outline-none"
                    style={{
                      background: `linear-gradient(to right, rgb(139 92 246) ${seekProgress}%, var(--echo-elevated) ${seekProgress}%)`,
                    }}
                  />
                </div>
              </>
            ) : isPreview ? (
              /* Read-only progress bar for previews */
              <div
                className="h-0.5 w-full rounded-full overflow-hidden"
                style={{
                  background: "var(--echo-elevated)",
                  pointerEvents: "none",
                }}
              >
                <div
                  className="h-full bg-cyan-400/30 rounded-full transition-all duration-300"
                  style={{ width: `${previewProgress}%` }}
                />
              </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
