# ECHO – Global Mini Audio Player

## Current State
- `MarketPage` manages `activePreviewId` locally (string | null) with a 30s timeout to simulate previews — no actual Audio element exists.
- Artwork rotation is driven by `isPlaying = activePreviewId === album.id` inside `MarketPage`.
- `App.tsx` renders `BottomNav` fixed at bottom; no global player exists.
- Track data in `TOP_ALBUMS` has no `preview_url` field; `albums.ts` `Track` type also lacks it.
- `BottomNav` is `z-50`, `h-[68px]`, fixed at bottom.

## Requested Changes (Diff)

### Add
- `AudioPlayerContext` (`src/frontend/src/context/AudioPlayerContext.tsx`): React context + provider that owns:
  - `currentTrack`: `{ id, title, artist, artworkSrc, preview_url } | null`
  - `isPlaying: boolean`
  - `play(track)`: stops any current audio, starts new HTMLAudio from `preview_url`, auto-stops at 30s
  - `pause()` / `resume()` toggle
  - `stop()`: clears track + audio
  - Exposes `activePreviewId: string | null` (= currentTrack?.id) for Discover rotation
- `MiniPlayer` component (`src/frontend/src/components/MiniPlayer.tsx`):
  - Fixed bar, `bottom-[68px]`, `z-40`, full width
  - Only renders when `currentTrack !== null`
  - Layout: left = square album thumbnail (40×40), center = track title + artist, right = play/pause icon button
  - Dark minimal style: `bg-[#111]/95 backdrop-blur border-t border-white/[0.07]`
  - Slide-up animation when it appears
- `preview_url` field added to `TOP_ALBUMS` mock entries (use royalty-free 30s mp3 URLs or empty strings as placeholder)

### Modify
- `App.tsx`: wrap entire app with `AudioPlayerProvider`; render `<MiniPlayer />` between `<main>` and `<BottomNav>`; adjust `pb-` on main to account for mini player height when visible (or keep `pb-28` which already gives enough room)
- `MarketPage`: remove local `activePreviewId` state and `previewTimerRef`; replace with `useAudioPlayer()` context; pass `activePreviewId` from context to `AlbumArtwork` for rotation; call `context.play(track)` / `context.stop()` on artwork tap

### Remove
- Local `activePreviewId` state and `previewTimerRef` from `MarketPage`

## Implementation Plan
1. Create `AudioPlayerContext.tsx` with provider, HTMLAudio management, 30s auto-stop, play/pause/stop API
2. Add `preview_url` to `TOP_ALBUMS` mock data (placeholder URLs)
3. Create `MiniPlayer.tsx` — fixed bar above BottomNav, conditional render, slide-up animation
4. Update `MarketPage` to consume context for preview state and rotation
5. Update `App.tsx` to wrap with provider and render MiniPlayer
6. Validate (lint + typecheck + build)
