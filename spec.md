# Minty — Pack Opening Slide Gesture Overhaul

## Current State
- Tapping a sealed pack in Collection shows an inline panel (first tap), then a second tap opens `PackDetailSheet` (bottom sheet)
- `PackDetailSheet` has an "Open Pack" button that calls the backend and then shows `PackOpeningOverlay`
- `PackOpeningOverlay` already has a slide-to-open control in the idle phase
- After the tear/reveal animation, the NFT is shown as a small 260px card with metadata and two buttons (View NFT / Back to Collection)
- Video NFTs show a static cover image with a VIDEO badge, not an actual fullscreen video

## Requested Changes (Diff)

### Add
- Fullscreen NFT reveal: after the tear animation, show the NFT media full-screen (entire viewport)
- Photo reveal: full-screen image, fade/scale in animation, dark immersive background
- Video reveal: full-screen autoplay looping video, no timeline, no scrub bar, no controls chrome — tapping once toggles minimal UI visibility
- Ambient glow behind video NFT (slightly slower reveal for rare feel)
- Minimal X close button always visible in top-right corner of the overlay
- Direct tap-to-open-overlay flow: tapping a sealed pack should go directly to `PackOpeningOverlay` without the intermediate `PackDetailSheet` bottom sheet

### Modify
- `PackOpeningOverlay`: replace the small card reveal with a full-screen immersive reveal
  - `reveal` + `action` phase: content fills the full viewport instead of being a 260px card
  - Photo phase: `<img>` fills viewport with object-fit cover, fade+scale in animation
  - Video phase: `<video autoPlay loop muted playsInline>` fills viewport, no controls, tap toggles UI
  - Metadata (title, rarity, edition, creator) fades in as minimal overlay — bottom of screen
  - "View NFT" and "Back to Collection" become slim floating buttons at bottom
  - The slide control label should read "Slide to open pack" (lowercase "pack")
- `PackDetailSheet`: remove entirely (or bypass it); on second tap of a sealed pack, directly trigger the opening flow
- `CollectionPage`: wire second-tap on sealed pack to immediately call `openPack(packId)` and show `PackOpeningOverlay` — no more `PackDetailSheet` intermediary

### Remove
- `PackDetailSheet` intermediary bottom sheet for sealed packs
- "Open Pack" button
- Small card reveal layout (260px card with side padding)
- Visible video playback controls, timeline, and progress bar in video NFT reveal

## Implementation Plan
1. Update `PackOpeningOverlay.tsx`:
   - Add a persistent X close button (top-right, always visible)
   - Update idle phase label to "Slide to open pack"
   - Replace `reveal`/`action` phases with a fullscreen reveal layout
   - Photo: full-viewport `<img>` with fade+scale animation, dark bg
   - Video: full-viewport `<video autoPlay loop muted playsInline>` with no controls; tap body toggles a UI layer; ambient glow behind video; slightly slower animation timing
   - Metadata overlay at bottom: title, rarity, edition, creator — fades in
   - Two floating action buttons at very bottom (View NFT / Back to Collection)
   - New keyframes: `nftFadeIn`, `nftScaleIn`, `videoGlow`, `uiToggleFade`
2. Update `CollectionPage.tsx`:
   - Remove `PackDetailSheet` import and usage
   - On second tap of a sealed pack: call `openPack(packId)`, store result in `openingPackNFT` state, show `PackOpeningOverlay` directly
   - Handle loading state (e.g. brief spinner or the pack can float while async resolves)
   - On overlay complete/close: clear state and refresh collection view
