# Minty — Auction Page

## Current State
- App has 4 bottom nav tabs: Library, Releases, Collection, Pet (cat)
- Weekly round system: 7-day rounds, users mint photo NFTs for $1 BTC, at round end Top 10 most liked survive
- `WeeklyRoundContext` tracks round state, fires `onRoundEnd` callback via `ReleasesMarketContext.finalizeRound`
- `ReleasesMarketContext` holds `MarketRelease[]` with `isTop10`, `roundId`, `likes` fields
- `AuctionContext` exists but tracks old 7-day auction listings unrelated to weekly round winners
- `BottomNav` has type `Tab = 'library' | 'releases' | 'collection'` — no auction tab
- `PackStyleContext` provides theme accent colors (Mint/Pink/Purple/Blue)
- App.tsx renders pages based on `view` state

## Requested Changes (Diff)

### Add
- New `Auction` tab in bottom navigation (5th tab, gavel/hammer icon)
- `AuctionPage` component — the main auction experience page
- `WeeklyAuctionContext` — manages the sequential 1-hour auction queue for the top 10 winners from completed rounds
- The auction queue: after round ends, the top 10 photos are added to a queue. Each photo gets exactly 1 hour. When one ends, next auto-starts. One active auction at a time.
- Live countdown timer per auction (counts down from 1 hour)
- Animated, alive bidding UI:
  - Pulsing glow on the current auction photo
  - Real-time countdown ring/bar animation
  - Bid history that animates in new bids from bottom
  - "LIVE" pulse badge when auction is active
  - Confetti/sparkle burst when bid is placed
  - Shake animation on the bid button when time is running low (<5 minutes)
  - Winner announcement animation when auction ends
- Bid placement: input BTC amount, confirm bid, minimum increment is current highest + 0.00001 BTC
- Show queue of upcoming auctions (the remaining top-10 NFTs waiting for their turn)
- Show past completed auctions with final price and winner
- Seed mock auction data with 10 top-10 photos from a "completed" round

### Modify
- `BottomNav.tsx`: add `auction` to the Tab type and tabs array
- `App.tsx`: add auction tab rendering, import `AuctionPage`, add `WeeklyAuctionProvider`
- `AuctionContext.tsx`: repurpose or leave as-is; new `WeeklyAuctionContext` handles the new queue logic
- `WeeklyRoundContext` / `ReleasesMarketContext`: when `finalizeRound` is called, pass top-10 winners into the weekly auction queue

### Remove
- Nothing removed from existing pages

## Implementation Plan
1. Create `src/frontend/src/context/WeeklyAuctionContext.tsx` with:
   - Queue of NFTs waiting for auction (from top-10 finalized rounds)
   - `activeAuction` — the currently live 1-hour auction item
   - `upcomingAuctions` — ordered queue of next items
   - `completedAuctions` — past ended items with winner/price
   - `placeBid(amount: number)` — places bid on active auction
   - Countdown logic (1 hour per NFT, auto-advances when time expires)
   - Seed mock data: 1 active auction (countdown ticking), 9 in queue from "Round #1 Top 10"
2. Create `src/frontend/src/pages/AuctionPage.tsx` with:
   - Hero section: current auction photo (large, full-width card) with pulsing glow
   - LIVE badge with pulse animation
   - 1-hour countdown ring animation (SVG circle or CSS arc)
   - Current highest bid (large, prominent)
   - Bid history list (scrollable, newest at top, slide-in animation)
   - Place Bid section: BTC amount input + Confirm Bid button with slide-to-confirm or tap flow
   - Upcoming queue: horizontal scroll of next 9 NFTs with rank badge
   - Completed section below: past winners
   - Animations: pulsing glow border on photo, shake on bid button at <5min, winner burst
3. Update `BottomNav.tsx`: add `auction` tab with `Gavel` icon from lucide-react
4. Update `App.tsx`: add auction tab to view type, render `AuctionPage`, wrap with `WeeklyAuctionProvider`
5. Wire `finalizeRound` in App.tsx / ReleasesMarketContext to also send top-10 NFTs into `WeeklyAuctionContext`
