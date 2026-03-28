import { createContext, useContext, useRef, useState } from "react";

export interface PlayerTrack {
  id: string;
  title: string;
  creator: string;
  artworkSrc: string | null;
  video_url: string;
  mode: "preview" | "library";
}

interface VideoPlayerContextValue {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  queue: PlayerTrack[];
  loopMode: "off" | "loop";
  currentTime: number;
  duration: number;
  play: (track: Omit<PlayerTrack, "mode">) => void;
  playPreview: (track: Omit<PlayerTrack, "mode">) => void;
  playLibrary: (track: Omit<PlayerTrack, "mode">) => void;
  addToQueue: (track: Omit<PlayerTrack, "mode">) => void;
  skipNext: () => void;
  skipPrevious: () => void;
  setLoopMode: (mode: "off" | "loop") => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

export function VideoPlayerProvider({
  children,
}: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [loopMode, setLoopMode] = useState<"off" | "loop">("off");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopModeRef = useRef<"off" | "loop">("off");
  const queueRef = useRef<PlayerTrack[]>([]);
  const currentTrackRef = useRef<PlayerTrack | null>(null);

  function syncLoopMode(mode: "off" | "loop") {
    loopModeRef.current = mode;
    setLoopMode(mode);
  }

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopVideo() {
    clearTimer();
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.onended = null;
      video.ontimeupdate = null;
      video.onloadedmetadata = null;
      video.src = "";
    }
    setCurrentTrack(null);
    currentTrackRef.current = null;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }

  function startVideo(track: PlayerTrack, onEnd?: () => void) {
    clearTimer();
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.onended = null;
    video.ontimeupdate = null;
    video.onloadedmetadata = null;

    setCurrentTrack(track);
    currentTrackRef.current = track;
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);

    if (track.video_url) {
      video.src = track.video_url;
      video.muted = false;
      video.ontimeupdate = () => setCurrentTime(video.currentTime);
      video.onloadedmetadata = () => setDuration(video.duration || 0);
      if (onEnd) video.onended = onEnd;
      video.play().catch(() => {});
    }
  }

  function handleLibraryEnd() {
    const mode = loopModeRef.current;
    const q = queueRef.current;
    const track = currentTrackRef.current;

    if (mode === "loop" && track) {
      startVideo(track, handleLibraryEnd);
      return;
    }

    if (q.length > 0) {
      const [next, ...rest] = q;
      queueRef.current = rest;
      setQueue(rest);
      startVideo(next, handleLibraryEnd);
    } else {
      setCurrentTrack(null);
      currentTrackRef.current = null;
      setIsPlaying(false);
    }
  }

  function playPreview(track: Omit<PlayerTrack, "mode">) {
    const fullTrack: PlayerTrack = { ...track, mode: "preview" };
    const video = videoRef.current;

    if (currentTrack?.id === track.id && currentTrack.mode === "preview") {
      if (video) {
        if (isPlaying) {
          video.pause();
          setIsPlaying(false);
        } else {
          video.play().catch(() => {});
          setIsPlaying(true);
        }
      }
      return;
    }

    clearTimer();
    if (video) {
      video.pause();
      video.onended = null;
      video.ontimeupdate = null;
      video.onloadedmetadata = null;
    }

    setCurrentTrack(fullTrack);
    currentTrackRef.current = fullTrack;
    setCurrentTime(0);
    setDuration(0);

    if (video && track.video_url) {
      video.src = track.video_url;
      video.muted = false;
      video.ontimeupdate = () => setCurrentTime(video.currentTime);
      video.onloadedmetadata = () => setDuration(video.duration || 0);
      video.play().catch(() => {});
      timerRef.current = setTimeout(() => {
        stopVideo();
      }, 30000);
    }

    setIsPlaying(true);
  }

  function playLibrary(track: Omit<PlayerTrack, "mode">) {
    const fullTrack: PlayerTrack = { ...track, mode: "library" };
    const video = videoRef.current;

    if (currentTrack?.id === track.id && currentTrack.mode === "library") {
      if (video) {
        if (isPlaying) {
          video.pause();
          setIsPlaying(false);
        } else {
          video.play().catch(() => {});
          setIsPlaying(true);
        }
      }
      return;
    }

    queueRef.current = [];
    setQueue([]);

    startVideo(fullTrack, handleLibraryEnd);
  }

  function addToQueue(track: Omit<PlayerTrack, "mode">) {
    const fullTrack: PlayerTrack = { ...track, mode: "library" };
    const updated = [...queueRef.current, fullTrack];
    queueRef.current = updated;
    setQueue(updated);
  }

  function skipNext() {
    const q = queueRef.current;
    if (q.length > 0) {
      const [next, ...rest] = q;
      queueRef.current = rest;
      setQueue(rest);
      startVideo(next, handleLibraryEnd);
    } else {
      stopVideo();
    }
  }

  function skipPrevious() {
    const video = videoRef.current;
    if (!video) {
      stopVideo();
      return;
    }
    if (video.currentTime > 3) {
      video.currentTime = 0;
      setCurrentTime(0);
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      stopVideo();
    }
  }

  function seek(seconds: number) {
    const video = videoRef.current;
    if (video) {
      video.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }

  function pause() {
    videoRef.current?.pause();
    setIsPlaying(false);
  }

  function resume() {
    videoRef.current?.play().catch(() => {});
    setIsPlaying(true);
  }

  return (
    <VideoPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        loopMode,
        currentTime,
        duration,
        play: playPreview,
        playPreview,
        playLibrary,
        addToQueue,
        skipNext,
        skipPrevious,
        setLoopMode: syncLoopMode,
        pause,
        resume,
        stop: stopVideo,
        seek,
      }}
    >
      <video
        ref={videoRef}
        playsInline
        style={{
          position: "fixed",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <track kind="captions" />
      </video>
      {children}
    </VideoPlayerContext.Provider>
  );
}

// Keep AudioPlayerProvider as alias for backward compat
export const AudioPlayerProvider = VideoPlayerProvider;

export function useVideoPlayer() {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx)
    throw new Error("useVideoPlayer must be used within VideoPlayerProvider");
  return ctx;
}

// Backward compat alias
export const useAudioPlayer = useVideoPlayer;
