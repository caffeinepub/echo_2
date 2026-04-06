# Minty — Releases Feed Enhancements

## Current State

ReleasesPage is a vertical snap-scroll photo feed. Each card shows:
- Full-screen photo
- "Minted by @username" bottom-left label
- Heart + like count bottom-right

Data lives in `ReleasesMarketContext`. Each `MarketRelease` has `listedAt` (timestamp in ms), `likes` (integer), and `creatorName`.

No sorting, filtering, or tabs exist on the page. Feed defaults to the insertion order.

## Requested Changes (Diff)

### Add
- **Mint date/time label** on each photo card — shows formatted date and time of mint (from `listedAt`). e.g. "Apr 6, 2026 · 2:14 PM". Position it above the "Minted by" label on bottom-left, or subtly below it.
- **Filter/sort tabs** at the top of the Releases feed — three options:
  1. **Most Recent** — sort by `listedAt` descending (newest first)
  2. **Trending** — sort by likes among posts minted in the **last 1 hour** (`listedAt >= now - 3600000`), descending by likes. If fewer than 3 posts in last hour, widen window to last 24h.
  3. **Most Liked** — sort all posts by `likes` descending, no time restriction
- Active tab indicator uses the current theme accent color
- Default active tab: **Most Recent**

### Modify
- `PhotoFeedItem` — add the mint date/time overlay text to each card
- `ReleasesPage` — add the 3-tab filter bar above the feed, apply sort logic before rendering
- Feed height must account for the filter bar height (~44px) so cards still fill the viewport correctly

### Remove
- Nothing removed

## Implementation Plan

1. Add filter bar component at top of ReleasesPage with 3 tabs: Most Recent, Trending, Most Liked. Style with pill/segmented appearance, accent color for active state.
2. Add sort logic:
   - Most Recent: `[...items].sort((a,b) => b.listedAt - a.listedAt)`
   - Trending: filter to last 1hr (fallback 24hr if <3 results), then sort by likes desc
   - Most Liked: sort by likes desc
3. Add mint date/time string to PhotoFeedItem bottom-left overlay, shown below the creator line. Format: "Apr 6, 2026 · 2:14 PM" using `Intl.DateTimeFormat` or `toLocaleDateString`.
4. Adjust feed container height to subtract filter bar height: `calc(100dvh - 64px - 68px - 44px)`.
5. Keep all existing PhotoFeedItem props and behavior intact.
