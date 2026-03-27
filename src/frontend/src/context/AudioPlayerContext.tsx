import { createContext, useContext, useRef, useState } from "react";

export interface PreviewTrack {
  id: string;
  title: string;
  artist: string;
  artworkSrc: string | null;
  preview_url: string;
}

interface AudioPlayerContextValue {
  currentTrack: PreviewTrack | null;
  isPlaying: boolean;
  play: (track: PreviewTrack) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({
  children,
}: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<PreviewTrack | null>(null);
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

  function play(track: PreviewTrack) {
    // If same track, toggle
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
      return;
    }

    // Stop current audio
    clearTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setCurrentTrack(track);

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
      value={{ currentTrack, isPlaying, play, pause, resume, stop: stopAudio }}
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
