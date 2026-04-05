# Minty Pack Visuals Update

## Current State
Sealed packs across the app use a CSS-only off-white rectangle with "MINTY PACK" text as a placeholder. The Library page has a complex flipping card system (PackCard front + PackBackside back) with a glass pedestal container. An off-white wrapper image already exists at `/assets/generated/pack-wrapper-cycle4-offwhite-transparent.dim_400x560.png`.

## Requested Changes (Diff)

### Add
- Off-white wrapper image displayed in LibraryPage as the main pack visual
- Wrapper image in CollectionPage sealed pack thumbnails (VaultTile)
- Wrapper image in PackOpeningOverlay during idle/anticipation/tear phases

### Modify
- LibraryPage: Remove flip card component (PackBackside), remove glass pedestal square, replace with wrapper image centered in card area behind text labels
- CollectionPage (VaultTile): Replace CSS text placeholder with wrapper image
- PackOpeningOverlay: Replace CSS text placeholder with wrapper image in idle, anticipation, and tear phases

### Remove
- PackBackside component entirely
- Flip hint SVG (top-right corner of PackCard)
- isFlipped state and all flip-related handlers
- Glass pedestal container div with its accentRgb border/glow
- 3D flip layer structure (Layer 1-4b)
- handleCardAreaClick, handleTouchStart/End for swipe
- Flip-related aria attributes

## Implementation Plan
1. Add wrapper image path constant
2. Rewrite PackCard in LibraryPage to display wrapper image behind text (no pedestal, no flip hint)
3. Remove PackBackside component
4. Simplify LibraryPage: replace 3D flip structure with simple card display
5. Update VaultTile in CollectionPage to use wrapper image for isPack tiles
6. Update PackOpeningOverlay idle/anticipation/tear phase pack visuals to use wrapper image
