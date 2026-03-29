import type React from "react";
import { createContext, useContext, useEffect, useRef } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";

export interface AudioReactiveValues {
  amplitude: number;
  bass: number;
  treble: number;
  peak: number;
}

const ZERO: AudioReactiveValues = { amplitude: 0, bass: 0, treble: 0, peak: 0 };
const AudioReactiveContext = createContext<AudioReactiveValues>(ZERO);

export function AudioReactiveProvider({
  children,
}: { children: React.ReactNode }) {
  const { isPlaying, currentTrack, audioRef } = useAudioPlayer();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const hookedElementRef = useRef<HTMLAudioElement | null>(null);
  const freqDataRef = useRef<Uint8Array<ArrayBuffer>>(
    new Uint8Array(128) as Uint8Array<ArrayBuffer>,
  );
  const rafRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const smoothedRef = useRef<AudioReactiveValues>({ ...ZERO });
  const corsFailedRef = useRef(false);
  const prefersReducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  function setCSSVars(s: AudioReactiveValues) {
    const r = document.documentElement;
    r.style.setProperty("--era-amp", s.amplitude.toFixed(3));
    r.style.setProperty("--era-bass", s.bass.toFixed(3));
    r.style.setProperty("--era-treble", s.treble.toFixed(3));
    r.style.setProperty("--era-peak", s.peak.toFixed(3));
  }

  function attachAnalyser(audio: HTMLAudioElement) {
    if (hookedElementRef.current === audio) return;
    if (corsFailedRef.current) {
      hookedElementRef.current = audio;
      return;
    }
    try {
      if (!audioCtxRef.current) {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AC();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {
          /* noop */
        }
        sourceRef.current = null;
      }

      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;
      source.connect(analyser);
      analyser.connect(ctx.destination);

      sourceRef.current = source;
      analyserRef.current = analyser;
      freqDataRef.current = new Uint8Array(
        analyser.frequencyBinCount,
      ) as Uint8Array<ArrayBuffer>;
      hookedElementRef.current = audio;
    } catch {
      corsFailedRef.current = true;
      hookedElementRef.current = audio;
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: stable function refs intentionally omitted
  useEffect(() => {
    if (prefersReducedMotion.current) {
      setCSSVars(ZERO);
      return;
    }

    const s = smoothedRef.current;

    if (!isPlaying) {
      let alive = true;
      const fade = () => {
        if (!alive) return;
        const k = 0.88;
        s.amplitude *= k;
        s.bass *= k;
        s.treble *= k;
        s.peak *= k;
        setCSSVars(s);
        if (s.amplitude > 0.002 || s.bass > 0.002) requestAnimationFrame(fade);
        else setCSSVars(ZERO);
      };
      requestAnimationFrame(fade);
      return () => {
        alive = false;
      };
    }

    const audio = audioRef.current;
    if (audio) attachAnalyser(audio);

    let running = true;
    function tick() {
      if (!running) return;
      frameCountRef.current++;
      if (frameCountRef.current % 3 !== 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const analyser = analyserRef.current;
      const data = freqDataRef.current;

      if (analyser && !corsFailedRef.current) {
        analyser.getByteFrequencyData(data);
        const len = data.length;
        let bassSum = 0;
        let trebleSum = 0;
        let ampSum = 0;
        let peak = 0;
        for (let i = 0; i < len; i++) {
          const v = data[i] / 255;
          ampSum += v;
          if (v > peak) peak = v;
          if (i < 5) bassSum += v;
          if (i >= 16 && i < 48) trebleSum += v;
        }
        const bassRaw = Math.min(1, bassSum / 5);
        const trebleRaw = Math.min(1, trebleSum / 32);
        const ampRaw = ampSum / len;

        const riseA = 0.3;
        const fallA = 0.07;
        const lerp = (cur: number, target: number) =>
          target > cur
            ? cur + (target - cur) * riseA
            : cur + (target - cur) * fallA;

        s.bass = lerp(s.bass, bassRaw);
        s.treble = lerp(s.treble, trebleRaw);
        s.amplitude = lerp(s.amplitude, ampRaw);
        s.peak =
          peak > s.peak
            ? s.peak + (peak - s.peak) * 0.45
            : s.peak + (peak - s.peak) * 0.06;
      } else {
        const t = performance.now() / 1000;
        const simBass = Math.max(
          0,
          Math.sin(t * 1.05) * 0.28 + Math.sin(t * 2.4) * 0.12 + 0.28,
        );
        const simTreble = Math.max(0, Math.sin(t * 3.8 + 1.5) * 0.18 + 0.14);
        const simAmp = Math.max(
          0,
          Math.sin(t * 0.75) * 0.18 + Math.sin(t * 1.85) * 0.08 + 0.28,
        );
        const simPeak = Math.max(0, Math.sin(t * 4.2) * 0.22 + 0.28);

        const alpha = 0.1;
        s.bass += (simBass - s.bass) * alpha;
        s.treble += (simTreble - s.treble) * alpha;
        s.amplitude += (simAmp - s.amplitude) * alpha;
        s.peak += (simPeak - s.peak) * alpha;
      }

      setCSSVars(s);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, currentTrack?.id]);

  return (
    <AudioReactiveContext.Provider value={smoothedRef.current}>
      {children}
    </AudioReactiveContext.Provider>
  );
}

export function useAudioReactive() {
  return useContext(AudioReactiveContext);
}
