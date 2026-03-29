# ECHO — Animated Album Art (Motion Covers)

## Current State
Each release/drop has a single `coverImage` (static image URL). The data models (`Song` in `data/songs.ts`, `AdminRelease` in `AdminReleasesContext`) have no motion cover fields. Cover art is rendered as plain `<img>` tags across all pages.

## Requested Changes (Diff)

### Add
- `coverMotion?: string` — optional URL/dataURL to a looping MP4/WebM file
- `motionEnabled?: boolean` — flag to enable animated cover for this release
- `AnimatedCover` reusable component (`components/AnimatedCover.tsx`):
  - Props: `coverImage`, `coverMotion?`, `motionEnabled?`, `animate: boolean`, `className?`
  - When `animate=true` AND `motionEnabled` AND `coverMotion` present AND not `prefers-reduced-motion`: render `<video autoPlay muted loop playsInline>` with `poster=coverImage`
  - Lazy-loads video src (only sets src when `animate=true`)
  - IntersectionObserver: pause video when off-screen
  - `document.visibilitychange`: pause when app is backgrounded
  - On video error: fall back to static `<img>`
  - Never shows browser controls (`controls` attribute absent)
  - Otherwise renders `<img src={coverImage}>`
- Admin upload form: "Animated Cover (MP4/WebM)" file input, stores as data URL in `coverMotion`; `motionEnabled` checkbox

### Modify
- `Song` type: add `coverMotion?`, `motionEnabled?`
- `AdminRelease` type: add `coverMotion?`, `motionEnabled?`
- `useReleasesData`: map new fields when converting AdminRelease → Song
- **MarketPage**: `animate=false` in leaderboard list rows; `animate=true` in expanded drop detail
- **ReleasesPage**: `animate=false` in scroll list; `animate=true` for active/expanded card
- **LibraryPage**: `animate=true` for now-playing item, `animate=false` for others
- **AlbumPlayerPage**: `animate=true` always on detail page
- **MiniPlayer**: `animate=true` when playing
- **ManageReleasesPage**: add animated cover upload + motionEnabled toggle in the new release form

### Remove
- Nothing

## Implementation Plan
1. Extend `Song` and `AdminRelease` types
2. Update `useReleasesData` mapping
3. Build `AnimatedCover` component
4. Replace cover img usage in all 5 locations with appropriate `animate` prop
5. Update admin form
6. Validate and build
