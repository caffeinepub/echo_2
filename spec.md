# Minty — 4:5 Portrait Aspect Ratio Enforcement

## Current State
Media is displayed at inconsistent aspect ratios across the app:
- Camera viewfinder: `3/4` aspect ratio
- Photo/video previews in capture flow: `3/4`
- Review thumbnails: `1` (square)
- Collection NFT tiles: `3/4`
- Collection compact pack tiles: `3/4`
- Collection set banner: `3/2` (landscape)
- Collection detail sheet images: `maxHeight: 260px` (no ratio)
- Pack reveal image: `maxHeight: 220px` (no ratio)
- Release cards: `height: 180px` (fixed px, no ratio)
- Release detail sheet cover: `height: 220px` (fixed px)
- Library pack flip card: `280x460` (~3:5 ratio)
- `useCamera.ts`: captures at `1920x1080` landscape by default; canvas outputs raw video dimensions

## Requested Changes (Diff)

### Add
- `MEDIA_ASPECT` constant (`4/5`) shared across components for consistency
- 4:5 crop logic in `useCamera.ts` `capturePhoto()` to output 1080x1350
- Camera constraints requesting portrait 1080x1350 resolution

### Modify
- `useCamera.ts`: change default width/height to `1080x1350`, update `capturePhoto` to center-crop to exactly 1080x1350 at 4:5 ratio
- `CaptureMomentPage.tsx`: all viewfinder/preview/thumbnail containers → `aspectRatio: "4/5"`; remove `3/4`; review grid thumbnails `1` → `4/5`
- `CollectionPage.tsx`: NFTTile image area `3/4` → `4/5`; CompactPackTile `3/4` → `4/5`; NFT detail sheet image wrapper → `aspectRatio: "4/5"` (remove maxHeight); pack reveal image wrapper → `aspectRatio: "4/5"` (remove maxHeight); SetGroupCard banner `3/2` → `4/5`
- `ReleasesPage.tsx`: ReleaseCard cover area `height: 180` → `aspectRatio: "4/5"`; ReleaseDetailSheet cover `height: 220` → `aspectRatio: "4/5"`; VideoPreviewModal → `aspectRatio: "4/5"` with `objectFit: cover`
- `LibraryPage.tsx`: flip card dimensions `280x460` → `280x350` (4:5 ratio)

### Remove
- All fixed-pixel `height` values on media containers in Releases cards
- All `maxHeight` constraints on image/video in detail sheets
- `aspectRatio: "3/4"` everywhere — replace with `"4/5"`

## Implementation Plan
1. Update `useCamera.ts` — set default `width: 1080, height: 1350`, and in `capturePhoto`, center-crop the canvas to 1080x1350 (4:5) from whatever the live video frame dimensions are
2. Update `CaptureMomentPage.tsx` — all aspect ratio values `3/4` → `4/5`, review thumbnails `1` → `4/5`
3. Update `CollectionPage.tsx` — all `3/4` containers to `4/5`, SetGroupCard banner to `4/5`, detail sheet images use `aspectRatio: "4/5"` wrapper instead of maxHeight
4. Update `ReleasesPage.tsx` — replace fixed-height media containers with `aspectRatio: "4/5"`, fix VideoPreviewModal
5. Update `LibraryPage.tsx` — flip card to 280x350
