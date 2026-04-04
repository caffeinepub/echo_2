# Minty — TCG Pack Backside Redesign

## Current State
The Library page has a flip card with two faces:
- **Front face**: `PackCard` component — Minty Pack product display with green pack image, floating animation, title, price, supply text, and Mint Moment button.
- **Back face**: `NftShelfBack` component — shows a "YOUR SHELF" header with a 2-column grid of NFT pack tiles (MOCK_NFTS), plus a "flip back" button and empty state.

The flip interaction (tap or swipe) is retained and working.

## Requested Changes (Diff)

### Add
- A new `PackBackside` component to replace `NftShelfBack`
- TCG booster pack backside layout with:
  - Small centered label: "MINTY PACK" (spaced caps, small)
  - Short description paragraph
  - Divider lines (thin, mint-tinted)
  - CONTENTS section with bullet list
  - COLLECTIBLE STRUCTURE section with bullet list
  - FOOTER section with small centered text and URL
  - Micro details: barcode-style SVG graphic near bottom, small recycling icon, tiny "web3 collectible" text
- Background: soft mint-tinted white with very subtle noise/grain texture (CSS or SVG filter)
- Subtle plastic/gloss sheen at top using a linear gradient overlay

### Modify
- Replace `NftShelfBack` usage in the BACK FACE of the flip card with the new `PackBackside` component
- Remove all NFT grid UI (MOCK_NFTS, NftPackTileComponent, NftShelfBack) from the back face rendering
- Keep all flip interaction logic unchanged (tap, swipe, aria labels, perspective 3D)
- Keep the "flip back" small button in the corner of the backside (can be very subtle)

### Remove
- `NftShelfBack` component (replaced by `PackBackside`)
- NFT grid rendering on the back face
- "YOUR SHELF" header on the back face
- `NftPackTileComponent` is only used in the shelf back — remove or leave unused (can be kept for future use but not rendered on back face)

## Implementation Plan
1. Build `PackBackside` component inside `LibraryPage.tsx`:
   - Same outer card dimensions as `PackCard`: width 280px, minHeight 380px (but taller to fit content), borderRadius 20px, boxShadow consistent
   - Background: `#F0F7F4` (soft mint-tinted white) with a subtle SVG noise filter or CSS repeating grain pattern at very low opacity
   - Thin gloss sheen div at top (linear-gradient white to transparent, ~35% height)
   - Scrollable inner content area with padding for dense TCG layout
   - All sections separated by thin divider lines (1px, rgba mint)
   - Typography: system sans-serif, clean, slightly condensed feel via letter-spacing and font-size
   - Micro details row at bottom: barcode SVG, recycling icon, "web3 collectible" text
   - Subtle "flip" icon button in top-right corner to return to front
2. Replace `<NftShelfBack onFlipBack=... />` with `<PackBackside onFlipBack=... />` in the BACK FACE div
3. Validate and build
