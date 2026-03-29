# ECHO — Audio-Reactive Lighting

## Current State
Echo has a global AudioPlayerContext with an HTMLAudioElement ref and plays/pauses tracks. MiniPlayer has static glow and waveform bars. No real-time audio analysis exists. Songs.ts has 15 mock tracks cycling through 3 audio URLs.

## Requested Changes (Diff)

### Add
- `AudioReactiveContext` — Web Audio API AnalyserNode attached to the playing audio element; exposes `{ amplitude, bass, treble, peak }` as smoothed 0–1 values via RAF loop (~20fps). Falls back to time-based simulation when CORS blocks `createMediaElementSource`. Pauses loop when `isPlaying === false`. Respects `prefers-reduced-motion` (returns zeros when reduced motion).
- 15 distinct audio URLs in `songs.ts` — use SoundHelix-Song-1 through 12 plus 3 Google media-session URLs for variety.
- CSS custom properties `--era-amp`, `--era-bass`, `--era-treble`, `--era-peak` set on `:root` from the RAF loop so CSS `calc()` rules drive effects without extra React renders.

### Modify
- `AudioPlayerContext` — expose `audioRef` as a readonly ref so `AudioReactiveContext` can attach the AnalyserNode when a new audio element is created.
- `MiniPlayer` — artwork glow reacts to `--era-bass`; waveform bars react to per-frequency-bin values; progress bar glow reacts to `--era-amp`; floating particle opacity reacts to `--era-amp`.
- `ReleasesPage` — active expanded card border and artwork glow pulse with `--era-bass`.
- `LibraryPage` — currently-playing card glow reacts to `--era-amp`.
- `index.css` — add `.echo-ra-glow`, `.echo-ra-border` utility classes using `calc(var(--era-bass) * ...)` for dark mode; add reduced-motion overrides.

### Remove
- Nothing removed; all existing animations preserved as fallback.

## Implementation Plan
1. Update `songs.ts` with 15 distinct audio URLs.
2. Add `audioRef` to `AudioPlayerContext` context value.
3. Create `context/AudioReactiveContext.tsx` — AnalyserNode setup, RAF loop, CSS property updates, simulation fallback.
4. Wrap `AudioReactiveContext.Provider` inside `AudioPlayerProvider` in `main.tsx` or `App.tsx`.
5. Update `MiniPlayer` — consume reactive CSS vars for glow and reactive waveform bars.
6. Update `ReleasesPage` — reactive active card halo.
7. Update `LibraryPage` — reactive playing card glow.
8. Update `index.css` — CSS utility classes and keyframes for reactive glow.
