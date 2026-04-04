# Minty — Collectible Card Component (Collections)

## Current State

The Collection tab renders opened collectibles via `VaultTile` — a compact 3-column grid tile with a full-bleed image, rarity pill, edition number pill, and a video badge. Tapping once reveals an `InlineDescPanel` below the row with title, set, and a stats grid. Tapping again opens a full media viewer or `NFTDetailSheet`.

`CollectionNFT` has: `id`, `title`, `setName`, `editionNumber`, `totalSupply`, `mediaType`, `imageUrl`, `rarity`, `mintDate`, `creator`, `owners`, `views`, `isLeader`, `hasOwnershipHistory`, `addedAt`, `burnedCount?`.

**Missing fields for the new card:** `capturedAt` (capture timestamp), `location` (capture location string).

## Requested Changes (Diff)

### Add
- `capturedAt?: string` and `location?: string` fields to `CollectionNFT` interface in `CollectionContext.tsx`
- Seed mock collectibles with sample `capturedAt` timestamps and `location` strings
- New `CollectibleCard` component at `src/frontend/src/components/CollectibleCard.tsx`
  - 4:5 portrait aspect ratio, generously rounded corners (16–20px)
  - Full-bleed cover image (photo) or video thumbnail (video) as card background
  - All metadata rendered as UI overlays — never baked into the media
  - **Overlay slots:**
    - Top-left: captured date/time (e.g. "Apr 3 · 11:42 PM")
    - Top-right: rarity pill (RARE / COMMON)
    - Bottom-left: location string (e.g. "New York, NY") with map-pin icon
    - Bottom-right: mint number out of total supply (e.g. "#3 / 90")
    - Video badge: small ▷ icon top-center or top-left alongside date
  - Overlays use frosted-glass pill styling (dark semi-transparent bg, soft white text, backdrop blur)
  - Subtle gradient scrim at top and bottom to ensure overlay legibility
  - Premium feel: soft mint-tinted border, subtle drop shadow, smooth rounded card
- **Tap-to-expand behavior:**
  - First tap: card smoothly scales up (e.g. 1.0 → 1.6x) in-place with a spring/ease animation, preserving layout in the grid (use `transform: scale`, not layout shift)
  - Expanded state shows the same overlays at proportionally larger size — layout is identical, just bigger
  - A second tap (or tap outside) scales back to normal
  - From expanded state, a "View" button or tap-hold gesture opens the full media viewer (existing `MediaViewerModal` for video, `NFTDetailSheet` for photo)
- Replace the current `VaultTile` rendering for opened collectibles (isPack=false) in `CollectionPage.tsx` with `CollectibleCard`
- Keep `VaultTile` unchanged for sealed packs (isPack=true)
- Remove `InlineDescPanel` as the primary detail trigger — the expanded card state replaces it. Keep `InlineDescPanel` if it provides additional data not shown on card.

### Modify
- `CollectionNFT` interface — add optional `capturedAt` and `location` fields
- Mock NFT seed data in `CollectionContext.tsx` — add sample captured timestamps and locations
- `CollectionPage.tsx` — swap `VaultTile` for `CollectibleCard` for opened NFTs; wire tap-expand → full media viewer

### Remove
- Nothing removed permanently. `VaultTile` stays for sealed packs. `InlineDescPanel` can remain as a secondary detail layer or be removed if the expanded card fully replaces it.

## Implementation Plan

1. **Update `CollectionNFT` interface** in `CollectionContext.tsx`: add `capturedAt?: string` (ISO string) and `location?: string`. Update the 3–5 mock NFTs with sample values like `capturedAt: "2026-04-03T23:42:00Z"` and `location: "New York, NY"`.

2. **Build `CollectibleCard` component** (`src/frontend/src/components/CollectibleCard.tsx`):
   - Props: `nft: CollectionNFT`, `onExpand?: () => void`, `onViewMedia?: () => void`
   - Internal `isExpanded` state; on tap, toggle between normal and scaled-up states using CSS `transform: scale()` + `transition` (spring-like cubic-bezier)
   - Use `position: relative` for the card container; overlays are `position: absolute`
   - Top scrim: linear-gradient from `rgba(0,0,0,0.45)` to transparent, ~40% height
   - Bottom scrim: linear-gradient from transparent to `rgba(0,0,0,0.55)`, ~35% height
   - Overlay pills: `backdrop-filter: blur(8px)`, `background: rgba(0,0,0,0.45)`, white text, `border-radius: 999px`, 4px vertical / 8px horizontal padding
   - Card border: `1px solid rgba(0, 200, 160, 0.25)` (mint tint)
   - Card shadow: `0 4px 20px rgba(0,0,0,0.35)`
   - Expanded scale: `1.62` with `z-index: 50` so card lifts above siblings; `transform-origin: center center`
   - When expanded, show a small "View" pill button at bottom-center that triggers full media viewer
   - When expanded, also show a subtle close affordance (small ✕ or tap-outside handler)

3. **Update `CollectionPage.tsx`**:
   - In `VaultTile` or the SetSection render loop: when `isPack === false`, render `<CollectibleCard nft={nft} onViewMedia={() => openMediaViewer(nft)} />` instead of the current `VaultTile` path
   - Wire `onViewMedia` to open the existing `MediaViewerModal` (video) or `NFTDetailSheet` (photo)
   - Grid stays 3 columns; expanded cards overlap via `z-index` without reflowing the grid

4. **Validate** — typecheck + build clean.
