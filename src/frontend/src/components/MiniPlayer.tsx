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
import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import { AnimatedCover } from "./AnimatedCover";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ─── hover opacity helpers ─── */
function onHoverIn(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.opacity = "0.9";
}
function onHoverOut(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.opacity = "0.5";
}

/* ─── Waveform bars ─── */
const BAR_DATA = [
  { id: "b0", dur: 0.7, delay: 0 },
  { id: "b1", dur: 0.5, delay: 0.08 },
  { id: "b2", dur: 0.8, delay: 0.16 },
  { id: "b3", dur: 0.6, delay: 0.24 },
  { id: "b4", dur: 0.9, delay: 0.32 },
  { id: "b5", dur: 0.55, delay: 0.4 },
  { id: "b6", dur: 0.75, delay: 0.48 },
  { id: "b7", dur: 0.65, delay: 0.56 },
  { id: "b8", dur: 0.85, delay: 0.64 },
];

function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-end gap-[2px] shrink-0 mr-1.5"
      style={{ height: 14, width: BAR_DATA.length * 4 - 2 }}
    >
      {BAR_DATA.map((bar) => (
        <div
          key={bar.id}
          style={{
            width: 2,
            borderRadius: 1,
            background: "linear-gradient(to top, #7c3aed, #a78bfa)",
            opacity: 0.55,
            height: "100%",
            transformOrigin: "bottom",
            animationName: "echoBar",
            animationDuration: `${bar.dur}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDirection: "alternate",
            animationDelay: `${bar.delay}s`,
            animationPlayState: isPlaying ? "running" : "paused",
            transform: isPlaying ? undefined : "scaleY(0.28)",
            transition: "transform 0.4s ease",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Floating particles ─── */
const PARTICLES = [
  { id: "p0", x: -8, delay: 0, dur: 5.5, size: 2.5, opacity: 0.16, warm: true },
  {
    id: "p1",
    x: 14,
    delay: 1.2,
    dur: 7.0,
    size: 2,
    opacity: 0.13,
    warm: false,
  },
  { id: "p2", x: 28, delay: 0.4, dur: 6.0, size: 3, opacity: 0.14, warm: true },
  {
    id: "p3",
    x: -18,
    delay: 2.0,
    dur: 8.5,
    size: 2,
    opacity: 0.12,
    warm: false,
  },
  {
    id: "p4",
    x: 5,
    delay: 0.8,
    dur: 4.8,
    size: 2.5,
    opacity: 0.18,
    warm: true,
  },
  {
    id: "p5",
    x: -28,
    delay: 1.6,
    dur: 6.8,
    size: 2,
    opacity: 0.11,
    warm: false,
  },
  { id: "p6", x: 22, delay: 2.8, dur: 5.2, size: 3, opacity: 0.15, warm: true },
];

function FloatingParticles({ isPlaying }: { isPlaying: boolean }) {
  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          key="particles"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-visible"
          style={{ zIndex: 1 }}
        >
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                bottom: "50%",
                left: "50%",
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: p.warm ? "#c4b5fd" : "#e0d7ff",
                opacity: p.opacity,
                transform: `translateX(${p.x}px)`,
                animationName: "echoFloat",
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Custom seek bar ─── */
function SeekBar({
  currentTime,
  duration,
  isPlaying,
  seek,
}: {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  seek: (t: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const pct = (currentTime / (duration || 1)) * 100;

  const getValueFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      return ratio * (duration || 0);
    },
    [duration],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      seek(getValueFromClientX(e.clientX));
    },
    [seek, getValueFromClientX],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      seek(getValueFromClientX(e.clientX));
    },
    [seek, getValueFromClientX],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") seek(Math.max(0, currentTime - 5));
      if (e.key === "ArrowRight") seek(Math.min(duration, currentTime + 5));
    },
    [seek, currentTime, duration],
  );

  return (
    <div
      ref={trackRef}
      data-ocid="mini_player.drag_handle"
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={duration || 100}
      aria-valuenow={Math.round(currentTime)}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      className="relative w-full h-1 rounded-full cursor-pointer overflow-hidden"
      style={{
        background: "var(--echo-elevated)",
        touchAction: "none",
      }}
    >
      {/* Filled track */}
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(to right, #7c3aed, #8b5cf6)",
          boxShadow: isPlaying
            ? "0 0 6px 1px rgba(139,92,246,0.55), 0 0 14px 2px rgba(139,92,246,0.2)"
            : "none",
          transition: "box-shadow 0.6s ease",
        }}
      >
        {/* Shimmer */}
        {isPlaying && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
              animationName: "echoShimmer",
              animationDuration: "3.5s",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
            }}
          />
        )}
      </div>
      {/* Thumb dot */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-sm"
        style={{
          left: `calc(${pct}% - 5px)`,
          boxShadow: "0 0 4px rgba(139,92,246,0.5)",
        }}
      />
    </div>
  );
}

/* ─── Main component ─── */
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

  // Tick for smooth preview bar
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (!isPreview || !isPlaying) return;
    const id = setInterval(() => forceUpdate((n) => n + 1), 300);
    return () => clearInterval(id);
  }, [isPreview, isPlaying]);

  const handleLoopHoverOut = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loopMode !== "loop") {
        e.currentTarget.style.opacity = "0.5";
      }
    },
    [loopMode],
  );

  return (
    <>
      {/* Injected keyframes */}
      <style>{`
        @keyframes echoBar {
          from { transform: scaleY(0.2); }
          to   { transform: scaleY(1); }
        }
        @keyframes echoFloat {
          0%   { transform: translateY(0px); opacity: 0.14; }
          60%  { transform: translateY(-28px); opacity: 0.06; }
          100% { transform: translateY(-48px); opacity: 0; }
        }
        @keyframes echoShimmer {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
        @keyframes echoGlowPulse {
          0%, 100% { box-shadow: 0 0 14px 4px rgba(139,92,246,0.35), 0 0 28px 6px rgba(99,60,220,0.18); }
          50%       { box-shadow: 0 0 22px 8px rgba(139,92,246,0.55), 0 0 44px 12px rgba(99,60,220,0.28); }
        }
      `}</style>

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
              {/* Artwork with glow + particles */}
              <div className="relative shrink-0">
                <FloatingParticles isPlaying={isPlaying} />
                <div
                  className="w-9 h-9 rounded-md overflow-hidden relative z-10"
                  style={{
                    background: "var(--echo-elevated)",
                    animationName: isPlaying ? "echoGlowPulse" : undefined,
                    animationDuration: "3.5s",
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    boxShadow: isPlaying ? undefined : "0 0 0 0 transparent",
                    transition: "box-shadow 0.8s ease",
                  }}
                >
                  {currentTrack.artworkSrc ? (
                    <AnimatedCover
                      coverImage={currentTrack.artworkSrc}
                      coverMotion={(currentTrack as any).coverMotion}
                      motionEnabled={(currentTrack as any).motionEnabled}
                      animate={isPlaying}
                      alt={currentTrack.title}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <WaveformBars isPlaying={isPlaying} />
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
                  onMouseEnter={onHoverIn}
                  onMouseLeave={onHoverOut}
                  className="w-7 h-7 flex items-center justify-center rounded-full transition-opacity"
                  style={{ color: "var(--echo-text-secondary)", opacity: 0.5 }}
                  aria-label="Previous"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Play/Pause */}
              <motion.button
                type="button"
                data-ocid="mini_player.toggle"
                onClick={() => (isPlaying ? pause() : resume())}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ color: "var(--echo-text)" }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-[18px] h-[18px]" />
                ) : (
                  <Play className="w-[18px] h-[18px]" />
                )}
              </motion.button>

              {/* Skip forward + loop — library only */}
              {isLibrary && (
                <>
                  <button
                    type="button"
                    data-ocid="mini_player.primary_button"
                    onClick={skipNext}
                    onMouseEnter={onHoverIn}
                    onMouseLeave={onHoverOut}
                    className="w-7 h-7 flex items-center justify-center rounded-full transition-opacity"
                    style={{
                      color: "var(--echo-text-secondary)",
                      opacity: 0.5,
                    }}
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
                    onMouseEnter={onHoverIn}
                    onMouseLeave={handleLoopHoverOut}
                    className="w-7 h-7 flex items-center justify-center rounded-full transition-opacity"
                    style={{ opacity: loopMode === "loop" ? 0.9 : 0.5 }}
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
                <>
                  <div className="flex justify-between mb-1.5">
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
                  <SeekBar
                    currentTime={currentTime}
                    duration={duration}
                    isPlaying={isPlaying}
                    seek={seek}
                  />
                </>
              ) : isPreview ? (
                <div
                  className="h-0.5 w-full rounded-full overflow-hidden"
                  style={{
                    background: "var(--echo-elevated)",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${previewProgress}%`,
                      background: "rgba(34,211,238,0.35)",
                      boxShadow: isPlaying
                        ? "0 0 6px 1px rgba(34,211,238,0.4)"
                        : "none",
                      transition: "box-shadow 0.6s ease, width 0.3s linear",
                    }}
                  />
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
