# Minty — NFT Tile Grid & Asset Detail Page

## Current State

The `LibraryPage.tsx` has a `Collected` tab that renders a `CollectedMediaGrid` component. Each grid tile directly shows the raw media thumbnail (`thumbnailUrl`) as a full-bleed image, with a minimal overlay showing the edition number and a type badge. Tapping a tile opens a `MediaDetailSheet` (bottom slide-up) that shows the media preview, creator, edition, price, and three action buttons (List for Sale, Transfer, Share).

The `OwnedMediaItem` data shape already has: `id`, `type`, `title`, `creator`, `editionNumber`, `isListed`, `price`, `duration`, `thumbnailUrl`.

The App.tsx view system uses a discriminated union `View` type; new views can be added as additional `{ type: ... }` variants.

## Requested Changes (Diff)

### Add
- **NFT tile visual style** in the Collected grid: each tile should represent the collectible edition as an object (pack-artwork style), NOT show the raw media directly. The tile shows a styled collectible card face with Minty brand visual, a media type badge (Photo/Video), edition number (`#12/100`), optional rarity indicator, soft shadows, rounded corners.
- **Rarity field** on `OwnedMediaItem` mock data (e.g. "Common", "Rare", "Ultra Rare").
- **Extended mock data** on `OwnedMediaItem` for the Asset Detail page: `totalSupply`, `minted`, `listed`, `held`, `lastSalePrice`, `floorPrice`, `totalVolume`, `views`, `favorites`, `ownershipHistory` (array of `{ address, date }`), `badges` (array of badge strings like `"#1 Trending"`, `"Top Volume"`, `"Most Viewed"`, `"Creator Featured"`).
- **Asset Detail Page** (`AssetDetailPage.tsx`) — a new full-page view (not a bottom sheet) navigated to when a tile is tapped:
  - Large media viewer at top: displays actual photo (img) or playable video (video element with controls)
  - Back button top-left
  - Metadata section: title, creator, edition number, media type badge, video duration if applicable
  - Scarcity section: total supply, minted, currently listed, held
  - Market data section: last sale price, floor price, total volume traded
  - Social metrics: views count, favorites/saves count
  - Ownership history: chronological list of previous owners with shortened wallet addresses (first 6...last 4 chars)
  - Badges row: display earned badges ("#1 Trending", "Top Volume", "Most Viewed", "Creator Featured") with mint-accented pill styling
  - Action buttons at bottom: List for Sale, Transfer, Share
- **New view type** in `App.tsx`: `{ type: "asset-detail"; id: string }` that renders `AssetDetailPage`
- Navigation: tapping an NFT tile in LibraryPage calls a new `onAssetClick(id)` prop that pushes the `asset-detail` view

### Modify
- `CollectedMediaGrid` → replace the raw thumbnail full-bleed tile with a **NFT collectible tile** design:
  - Off-white/soft gradient card background (not the raw media image)
  - Minty collectible artwork area: abstract mint gradient or decorative pattern as the "pack art" visual
  - Type badge (Photo/Video) — top left
  - Rarity badge — top right (if present)
  - Edition number centered at bottom inside tile
  - Listed indicator (green dot) preserved
  - No full media preview in the grid
- `OwnedMediaItem` interface — add `rarity?`, `totalSupply`, `minted`, `listed`, `held`, `lastSalePrice?`, `floorPrice?`, `totalVolume`, `views`, `favorites`, `ownershipHistory`, `badges`
- `MOCK_OWNED_MEDIA` — populate all new fields with realistic mock values
- `LibraryPage` — replace `MediaDetailSheet` with navigation to `AssetDetailPage` via `onAssetClick` prop callback; remove the old bottom sheet entirely from LibraryPage
- `App.tsx` — add `asset-detail` view case; pass `onAssetClick` to LibraryPage

### Remove
- `MediaDetailSheet` component from `LibraryPage.tsx` (replaced by full Asset Detail page)
- Full-bleed raw thumbnail rendering inside the collected grid tiles

## Implementation Plan

1. Extend `OwnedMediaItem` interface with new fields; update `MOCK_OWNED_MEDIA` with all new data
2. Redesign `CollectedMediaGrid` tile to show NFT collectible card style (mint gradient art panel, badges, edition, no raw media)
3. Create `src/frontend/src/pages/AssetDetailPage.tsx` with all sections: media viewer, metadata, scarcity, market data, social, ownership history, badges, action buttons
4. Remove `MediaDetailSheet` from `LibraryPage`; add `onAssetClick: (id: string) => void` prop; wire tile tap to call it
5. Add `{ type: "asset-detail"; id: string }` to the `View` union in `App.tsx`; render `<AssetDetailPage>` with back navigation
