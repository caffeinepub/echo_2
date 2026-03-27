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
  play: (track: Omit<PlayerTrack, "mode">) => void; // alias for playPreview
  playPreview: (track: Omit<PlayerTrack, "mode">) => void;
  playLibrary: (track: Omit<PlayerTrack, "mode">) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({
  children,
}: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      audioRef.current = null;
    }
    setCurrentTrack(null);
    setIsPlaying(false);
  }

  function playPreview(track: Omit<PlayerTrack, "mode">) {
    const fullTrack: PlayerTrack = { ...track, mode: "preview" };

    // Same track — toggle
    if (currentTrack?.id === track.id && currentTrack.mode === "preview") {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
      return;
    }

    // Stop current
    clearTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setCurrentTrack(fullTrack);

    if (track.preview_url) {
      const audio = new Audio(track.preview_url);
      audioRef.current = audio;
      audio.play().catch(() => {});
      timerRef.current = setTimeout(() => {
        stopAudio();
      }, 30000);
    }

    setIsPlaying(true);
  }

  function playLibrary(track: Omit<PlayerTrack, "mode">) {
    const fullTrack: PlayerTrack = { ...track, mode: "library" };

    // Same track — toggle play/pause
    if (currentTrack?.id === track.id && currentTrack.mode === "library") {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    // Stop current (no 30s timer for library)
    clearTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setCurrentTrack(fullTrack);

    if (track.preview_url) {
      const audio = new Audio(track.preview_url);
      audioRef.current = audio;
      audio.play().catch(() => {});
    }
    // Even without real audio, set playing = true (mock playback)
    setIsPlaying(true);
  }

  function pause() {
    audioRef.current?.pause();
    setIsPlaying(false);
  }

  function resume() {
    audioRef.current?.play().catch(() => {});
    setIsPlaying(true);
  }

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        play: playPreview,
        playPreview,
        playLibrary,
        pause,
        resume,
        stop: stopAudio,
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
