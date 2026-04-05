# Minty — Weekly Leaderboard (Collections Tab)

## Current State

The Collections tab (`src/frontend/src/pages/CollectionPage.tsx`) currently renders:
- A segmented toggle between "Collection" and "Leaderboard" views
- A sealed packs horizontal scroll section
- An opened collectibles 2–3 column grid
- A leaderboard view showing top 10 NFTs by highest sale price with looping video mini-players
- Pack wrappers, rarity labels, mint counts, serial numbers, collection grouping, set details

Data comes from `CollectionContext` (sealed packs, opened NFTs) and `ReleasesMarketContext` (releases with `likes`, `listedAt`, `previewClipUrl`, `title`, `creatorName` fields).

## Requested Changes (Diff)

### Add
- New Weekly Leaderboard page component replacing CollectionPage entirely
- Header: "Top 25 This Week" + subtext "Most liked 7 sec clips in the last 7 days"
- Ranked list (#1–#25) of releases filtered by `listedAt >= now - 7 days`, sorted descending by `likes`, limited to 25
- Each leaderboard item: rank number, looping video preview (autoplay, muted, loop), title, like count (display only)
- Top 3 items get slightly larger cards; ranks 4–25 uniform size
- IntersectionObserver lazy-load: videos below the fold don't autoplay until in view
- Tap video toggles sound on/off
- Theme-aware accent colors via `usePackStyle()` context

### Modify
- Replace `CollectionPage.tsx` entirely with the new leaderboard-only page
- `App.tsx` `CollectionPage` import/usage stays the same (same component name, same prop `onGoToLibrary` — can be kept for potential back navigation but not necessarily used)
- Seed data in `ReleasesMarketContext` already has `likes` and `previewClipUrl` fields — add varied `listedAt` values within the last 7 days and higher like counts for ranking variety
- Ensure seed data covers 5+ entries with `listedAt` within 7 days so leaderboard is populated

### Remove
- All CollectionPage content: pack wrappers, NFT grid, sealed packs, rarity labels, mint counts, serial numbers, location metadata, collection grouping, collection/leaderboard toggle
- All imports from `CollectionContext`, `AuctionContext`, `CollectibleCard`, `PackOpeningOverlay`, `ReleaseFlowModal` that no longer apply

## Implementation Plan

1. **Update seed data** in `ReleasesMarketContext.tsx`:
   - Set all seed release `listedAt` values to within the last 7 days (use `NOW - X * H` where X < 168)
   - Assign varied `likes` counts (e.g. 12482, 8301, 6744, 3210, 1987, 512, etc.) to create clear ranking order
   - Add more seed entries (up to 8–10) with unique `previewClipUrl` values pointing to public test video URLs so the top 25 filter has content to show

2. **Rewrite `CollectionPage.tsx`** as `WeeklyLeaderboardPage`:
   - Remove all old imports
   - Import `useReleasesMarket` from `ReleasesMarketContext`
   - Import `usePackStyle` from `PackStyleContext`
   - Filter releases: `listedAt >= Date.now() - 7 * 24 * 3600 * 1000` and `status !== 'burned'`
   - Sort by `likes` descending, slice to 25
   - Render header section: "Top 25 This Week" / subtext
   - Render ranked list using a `LeaderboardItem` sub-component
   - `LeaderboardItem` props: `rank`, `release`, `accentColor`
     - Card size: ranks 1–3 get larger padding/font; ranks 4–25 uniform
     - Video: `<video autoPlay muted loop playsInline>`, IntersectionObserver play/pause, tap toggles mute
     - Rank number: bold, theme accent color, `#1` slightly larger
     - Title: DM Sans, weight 600
     - Like count: `♥ {likes.toLocaleString()}`, subtle gray
   - Empty state: soft message when fewer than 1 result in window
   - Accept `onGoToLibrary?: () => void` prop (unused but keeps App.tsx interface clean)

3. **Styling** consistent with Minty design language:
   - Off-white card backgrounds (`#FAFAF8` or similar)
   - Soft shadows (`box-shadow: 0 2px 12px rgba(0,0,0,0.07)`)
   - Rounded corners (16–20px)
   - DM Sans font throughout
   - Vertical scroll only, no grid
   - `px-4` horizontal padding, consistent vertical spacing
