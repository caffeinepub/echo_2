# Minty

## Current State
ReleasesPage.tsx has a filter bar (Most Viewed / New / Minted) followed by a feed of slab listing cards. No leaderboard component exists above the filters.

## Requested Changes (Diff)

### Add
- `TopVolumeLeaderboard` component inline in ReleasesPage.tsx
- 10 mock leaderboard entries with: id, cardName, setName, imageUrl, totalVolumeUsd, transactionCount
- Horizontal scroll container with scroll-snap, placed above the sticky filter bar
- Each tile (~140px wide): card image, rank badge (#1–#10) top-left, volume label, sales count
- Hover: subtle mint accent glow
- Tap/click navigates to card detail (opens SlabDetailSheet with matching slab or mock data)

### Modify
- ReleasesPage render: insert `<TopVolumeLeaderboard>` above the sticky filter bar div

### Remove
- Nothing

## Implementation Plan
1. Define `TopVolumeEntry` interface and `TOP_VOLUME_MOCK` array (10 entries, volume desc)
2. Build `TopVolumeLeaderboard` functional component with horizontal scroll snap
3. Style tiles: 140px wide, white bg, rounded corners, rank badge, volume/sales text, mint glow on hover
4. Wire tile click to open the existing `SlabDetailSheet` (match by id or fall back to first slab)
5. Insert component above filter bar in `ReleasesPage`
