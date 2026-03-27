# ECHO — Unified Mini Audio Player

## Current State
- `AudioPlayerContext` manages a global preview player with a 30s auto-stop timer. It holds a `PreviewTrack` (id, title, artist, artworkSrc, preview_url).
- `MiniPlayer` renders above the nav bar using this context — play/pause/close.
- `MarketPage` (Discover) calls `play(track)` from context when album artwork is tapped.
- `AlbumPlayerPage` has its own isolated local state (`isPlaying`, `activeTrack`, `progress`) — it does NOT use the global audio context at all.
- The mini player is only visible during Discover previews, never during Library playback.

## Requested Changes (Diff)

### Add
- `mode` field to the player context: `'preview' | 'library'`
- `playLibrary(track)` function in context — plays without a 30s timer
- `playPreview(track)` function (or rename existing `play` to make mode explicit)
- Optional `isPreview` boolean on the `PreviewTrack` interface
- "Preview" badge/label in `MiniPlayer` when mode is `'preview'` — subtle, muted, small

### Modify
- `AudioPlayerContext`: add `mode` state; `playPreview` sets mode to `'preview'` and starts 30s timer; `playLibrary` sets mode to `'library'` with no timer; `stop` clears both.
- `MiniPlayer`: show subtle "Preview" tag when `mode === 'preview'`; same layout otherwise.
- `AlbumPlayerPage`: remove local `isPlaying`/`activeTrack` state for playback; wire `handleTrackClick` and play/pause controls to call `playLibrary` from context; read `isPlaying` and active track ID from context to determine UI state (highlight active track, show play/pause icon in correct state). Keep local state only for `progress` (scrub bar), `isLooping`, `isFlipped`, `showHint`.
- `MarketPage`: rename `play` call to `playPreview` (or pass mode) so the context sets mode to preview.

### Remove
- Local `isPlaying` and `setIsPlaying` from `AlbumPlayerPage` for playback control (replaced by context)

## Implementation Plan
1. Update `AudioPlayerContext`: add `mode`, `playPreview` (existing `play` renamed/extended), `playLibrary` (no timer), expose both via context value.
2. Update `MiniPlayer`: show "PREVIEW" micro-label when `mode === 'preview'` — muted text, no badge box, fits the minimal aesthetic.
3. Update `AlbumPlayerPage`: import `useAudioPlayer`; on track click, call `playLibrary({ id: albumId+trackIndex, title, artist, artworkSrc, preview_url: '' })`; derive `isTrackActive` from context's `currentTrack.id`; derive play button state from context's `isPlaying`.
4. Update `MarketPage`: call `playPreview` instead of `play` (or pass the same `play` if we keep backward compat via mode detection).
