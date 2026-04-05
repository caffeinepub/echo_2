# Minty — Auction Card Info Bar

## Current State
The Market tab in ReleasesPage.tsx displays auction listings in a 2-column grid. Each auction tile shows: NFT image, title, highest bid, bid count, time remaining, and a Place Bid button. There is no info bar like the bonding curve bar on pack release cards.

Pack release cards (ReleaseCard component in ReleasesPage.tsx) have a well-designed bonding curve info section with:
- Large current price + `per pack` label
- Sub-line: `{remaining} remaining • next ${nextPrice}`
- Thin 3px progress bar with `{n}% collected` label
- Activity dot + `last mint Xs ago` label
- `+0.01` flash on price change
- Momentum signals: `Early price`, `Almost gone`, `🔥 trending`

Auction listings come from `AuctionContext.tsx` — each `AuctionListing` has:
- `highestBid: number` (0 if no bids)
- `bids: Bid[]` (each with `placedAt: number` timestamp)
- `endsAt: number` (auction end timestamp)
- `status: 'active' | 'ended'`

## Requested Changes (Diff)

### Add
- Auction info bar inside each Market grid tile (below the image, above the bid button)
- Info bar includes:
  1. Current bid: `$42.50` (prominent, large font matching pack price prominence)
  2. Next minimum bid: `Next bid: $43.50` (sub-line, +$1 over current, or opening bid if none)
  3. Bid activity: `3 bids • last bid 18s ago` (live-ticking seconds)
  4. Thin progress bar representing time elapsed since auction start vs total 24h duration, with label `5h 59m left`
  5. Soft animation on value changes (CSS transition on bid amount)
  6. `No bids yet` state when `bids.length === 0`

### Modify
- Market auction tile component to include the new info bar section
- Time remaining label already exists — move it inside the new info bar section replacing the standalone display

### Remove
- Standalone minimal time/bid display that currently exists on tiles (replaced by the new info bar)

## Implementation Plan
1. In ReleasesPage.tsx, find the Market tile render (the 2-column grid tile, look for `AuctionListing` rendering in the market grid section)
2. Add `AuctionInfoBar` component inline or as a named function component within ReleasesPage.tsx
3. `AuctionInfoBar` receives `listing: AuctionListing`, `accentSolid`, `accentRgb` props
4. Implement live tick using `useState(Date.now())` + `setInterval(1000)` inside the bar
5. Progress bar: `elapsed = Date.now() - (endsAt - 24h)`, fill = `elapsed / (24h)`, clamped 0–100%
6. Next bid = highestBid > 0 ? highestBid + 1.00 : 1.00 (opening bid)
7. Last bid ago: derive from `bids[bids.length-1].placedAt` — live-ticking seconds
8. Bid amount change: use `useRef` to track previous highestBid and `CSS transition` on the value
9. Match exact visual style of pack card info bar: same font sizes, same color palette, same 3px bar height, same subtle dot pulse animation
