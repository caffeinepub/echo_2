import { createContext, useContext, useRef, useState } from "react";

export interface PlayerTrack {
  id: string;
  title: string;
  artist: string;
  artworkSrc: string | null;
  preview_url: string;
  mode: "preview" | "library";
}

interface AudioPlayerContextValue {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  queue: PlayerTrack[];
  loopMode: "off" | "loop";
  currentTime: number;
  duration: number;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
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

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

function createAudio(url: string): HTMLAudioElement {
  const audio = new Audio();
  // playsInline helps with iOS inline playback
  audio.setAttribute("playsinline", "");
  audio.setAttribute("webkit-playsinline", "");
  audio.preload = "auto";
  audio.volume = 1;
  audio.src = url;
  audio.onerror = () =>
    console.error("[Echo Player] audio load error:", audio.error?.message, url);
  return audio;
}

export function AudioPlayerProvider({
  children,
}: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [loopMode, setLoopMode] = useState<"off" | "loop">("off");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  function stopAudio() {
    clearTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    setCurrentTrack(null);
    currentTrackRef.current = null;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }

  function startAudio(track: PlayerTrack, onEnd?: () => void) {
    clearTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }

    setCurrentTrack(track);
    currentTrackRef.current = track;
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);

    if (track.preview_url) {
      const audio = createAudio(track.preview_url);
      audioRef.current = audio;
      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.onloadedmetadata = () => setDuration(audio.duration || 0);
      if (onEnd) audio.onended = onEnd;
      audio
        .play()
        .catch((err) => console.error("[Echo Player] play failed:", err));
    }
  }

  function handleLibraryEnd() {
    const mode = loopModeRef.current;
    const q = queueRef.current;
    const track = currentTrackRef.current;

    if (mode === "loop" && track) {
      startAudio(track, handleLibraryEnd);
      return;
    }

    if (q.length > 0) {
      const [next, ...rest] = q;
      queueRef.current = rest;
      setQueue(rest);
      startAudio(next, handleLibraryEnd);
    } else {
      setCurrentTrack(null);
      currentTrackRef.current = null;
      setIsPlaying(false);
    }
  }

  function playPreview(track: Omit<PlayerTrack, "mode">) {
    const fullTrack: PlayerTrack = { ...track, mode: "preview" };

    if (currentTrack?.id === track.id && currentTrack.mode === "preview") {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current) {
          audioRef.current.volume = 1;
          audioRef.current
            .play()
            .catch((err) => console.error("[Echo Player] play failed:", err));
        }
        setIsPlaying(true);
      }
      return;
    }

    clearTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }

    setCurrentTrack(fullTrack);
    currentTrackRef.current = fullTrack;
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(true);

    if (track.preview_url) {
      const audio = createAudio(track.preview_url);
      audioRef.current = audio;
      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.onloadedmetadata = () => setDuration(audio.duration || 0);
      audio
        .play()
        .catch((err) => console.error("[Echo Player] play failed:", err));
      timerRef.current = setTimeout(() => {
        stopAudio();
      }, 30000);
    }
  }

  function playLibrary(track: Omit<PlayerTrack, "mode">) {
    const fullTrack: PlayerTrack = { ...track, mode: "library" };

    if (currentTrack?.id === track.id && currentTrack.mode === "library") {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current) {
          audioRef.current.volume = 1;
          audioRef.current
            .play()
            .catch((err) => console.error("[Echo Player] play failed:", err));
        }
        setIsPlaying(true);
      }
      return;
    }

    queueRef.current = [];
    setQueue([]);

    startAudio(fullTrack, handleLibraryEnd);
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
      startAudio(next, handleLibraryEnd);
    } else {
      stopAudio();
    }
  }

  function skipPrevious() {
    if (!audioRef.current) {
      stopAudio();
      return;
    }
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.volume = 1;
      audioRef.current
        .play()
        .catch((err) => console.error("[Echo Player] play failed:", err));
      setIsPlaying(true);
    } else {
      stopAudio();
    }
  }

  function seek(seconds: number) {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }

  function pause() {
    audioRef.current?.pause();
    setIsPlaying(false);
  }

  function resume() {
    if (audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current
        .play()
        .catch((err) => console.error("[Echo Player] play failed:", err));
    }
    setIsPlaying(true);
  }

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        loopMode,
        currentTime,
        duration,
        audioRef,
        play: playPreview,
        playPreview,
        playLibrary,
        addToQueue,
        skipNext,
        skipPrevious,
        setLoopMode: syncLoopMode,
        pause,
        resume,
        stop: stopAudio,
        seek,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx)
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return ctx;
}
