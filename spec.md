# Minty — Collection Tab Vault Redesign

## Current State
CollectionPage.tsx (~1975 lines) renders:
- A main page showing SetGroupCard items in a vertical list (large cards with 4:5 image + stats below)
- Tapping a set opens SetDetailView (full-screen overlay) showing CompactPackTile (3-col) and NFTTile (2-col) grids
- Tapping a pack/NFT opens PackDetailSheet or NFTDetailSheet (bottom sheets)
- CollectionContext holds nfts[], sealedPacks[], and CRUD methods — must not change

Problems: Set cards are large and card-like (ecommerce feel), the two-level navigation (set → detail overlay → bottom sheet) feels clunky, tiles inside SetDetailView are still fairly large, and there's no inline expand behavior.

## Requested Changes (Diff)

### Add
- **Vault layout**: All sets rendered inline on the main page (no full-screen overlay). Each set has a compact sticky-style section header showing set title, total/sealed/opened counts.
- **Compact tile grid**: 3-column grid for sealed packs, 3-column grid for opened collectibles — small Pokédex-style tiles (~square, not tall cards)
- **Bubble/pop animation on first tap**: CSS spring scale animation on tile tap
- **Inline description panel**: First tap reveals a metadata panel expanding inline directly under the tapped tile row (Pokédex entry feel). Panel shows: title, type, print #/total, set name, sealed status, minted date, creator, rarity, origin (self-minted / purchased)
- **Second tap behavior**: If same tile is tapped again, open a media modal (photo: clean fullscreen image overlay; video: video player modal muted by default with unmute toggle; pack: opens existing PackDetailSheet)
- **Media viewer modal**: Full-screen centered overlay for photos/videos, premium minimal styling, close button
- **Release button**: Stays at set-header level, compact pill

### Modify
- **SetGroupCard**: Replace large card with compact inline section header (no image thumbnail in header, just text stats + mint accent bar)
- **NFTTile**: Shrink to compact ~square tile (3-column), remove large info footer — just image + tiny badges on corners
- **CompactPackTile**: Keep similar but ensure consistent with new tile system
- **SetDetailView overlay**: Remove entirely — inline expand replaces it
- Main page layout: single scrollable vault, sets stacked vertically with section separators

### Remove
- SetDetailView full-screen overlay (replaced by inline vault layout)
- SetGroupCard large image card format
- Separate selectedSet state driving full-screen navigation

## Implementation Plan
1. Keep CollectionContext and all data types exactly as-is
2. Keep PackDetailSheet, NFTDetailSheet, SendToWalletModal components as-is (they're bottom sheets that still work for second-tap)
3. Rewrite main page layout: iterate setGroups, render each inline with a compact section header + tile grids
4. New VaultTile component: 3-col square tile with image, sealed badge, media type badge, rarity dot — no text below
5. New InlineDescPanel component: expands under the row containing the selected tile, smooth CSS height animation
6. Track selectedTileId (first tap) and secondTapId (second tap → opens modal/sheet)
7. New MediaViewerModal: handles photo fullscreen + video player
8. Bubble pop: CSS keyframe on tile press (scale 1 → 1.06 → 0.97 → 1)
9. Keep ReleaseFlowModal integration unchanged
