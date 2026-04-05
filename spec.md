# Minty — Market Grid Layout

## Current State
The Market tab (inside ReleasesPage.tsx, `viewMode === 'market'`) renders auction listings as a vertical column of full-width `AuctionCard` components. Each card is a tall portrait card (4:5 image ratio) followed by a large info block with creator row, title, highest bid, bid count, time remaining, and a full-width Place Bid button. Cards are sorted by insertion order (no live reordering). The `PlaceBidModal` and `SlideToConfirm` components are unchanged and working.

## Requested Changes (Diff)

### Add
- 2-column CSS grid layout for the Market view container (gap ~8–10px, padding 12px)
- New compact `AuctionGridTile` component to replace the existing `AuctionCard` for the Market view only
  - Top: NFT image (square or 1:1 aspect ratio) with lazy loading (`loading="lazy"`), soft gradient overlay at bottom, video badge if mediaType === "video"
  - Bottom info block: NFT title (truncated 1 line, ~13px semibold), current highest bid ($XX.XX bold ~15px, or "No bids" muted), time remaining (small, with timer icon, accent-colored), bid count (small muted optional text)
  - Tap anywhere on tile opens the existing `PlaceBidModal` (unchanged)
  - Rounded corners (~16px), soft shadow, white background, thin border
- Auto-reorder: sort active listings by `mostRecentBidTimestamp` descending (most recent bid → top-left). Use `Math.max(...bids.map(b => b.placedAt))` or fallback to listing creation order
- Live pulse: on each sort update (when `listings` changes), briefly flash a subtle accent-colored ring or scale on the newly moved tile (CSS animation, 600ms, optional)
- `useIntersectionObserver` or native `loading="lazy"` on images for scroll-based lazy loading

### Modify
- Market view container: replace `flexDirection: column` with `display: grid, gridTemplateColumns: repeat(2, 1fr)` 
- Sort `auctionListings` before mapping: sort by latest bid timestamp descending
- Keep the empty state (no auctions) unchanged
- `AuctionCard` component stays in the file — it is not deleted — just not used for the Market grid (can be kept as-is for potential future use, or renamed)

### Remove
- The existing `AuctionCard` component usage in the Market view (replaced by `AuctionGridTile`)
- No sorting dropdowns or filter pills in the Market view

## Implementation Plan
1. Add a sort helper in the Market view section that sorts `auctionListings` by `Math.max(...bids.map(b => b.placedAt), 0)` descending — so listings with most recent bids appear first
2. Change the Market view container div from `flexDirection: column` to `display: grid, gridTemplateColumns: repeat(2, 1fr), gap: 10`
3. Create `AuctionGridTile` component inline (above or below `AuctionCard`) with:
   - Compact square/portrait image top section (aspect-ratio 1/1 or 4/5, `loading="lazy"`)
   - Bottom info: title (1 line clamp), bid amount, time remaining, bid count
   - `onClick` → `setShowBidModal(true)` → renders existing `PlaceBidModal`
   - Styled with white bg, 16px border-radius, soft shadow, 1.5px accent border on hover
4. Replace `<AuctionCard ... />` in the Market grid render with `<AuctionGridTile ... />`
5. Add `@keyframes tilePulse` (brief scale + ring flash) triggered when a tile receives a new bid (track `listing.bids.length` in a ref)
6. Verify PlaceBidModal opens correctly from tile tap and all bid functionality remains unchanged
