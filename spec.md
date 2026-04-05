# Minty — Vine-style Releases Feed

## Current State

The Releases tab (`ReleasesPage.tsx`) currently shows a vertical scrollable grid of pack cards (`ReleaseCard`). Each card displays:
- Cover media (video clip or image) with 4/5 aspect ratio
- Creator name, title, caption
- Pack price, supply remaining, bonding curve price, progress bar
- Countdown timer, trending signals, activity pulses
- Buy Pack button (opens `BuyPacksModal`)
- Packs/Market toggle (for auction tab)
- Trending hashtags section, Hot Packs section, ticker bar, safe view toggle

`ReleasesMarketContext` provides `MarketRelease[]` which includes all pack market fields. The `likes` field does not currently exist on `MarketRelease`.

## Requested Changes (Diff)

### Add
- `likes` field (integer, default 0) to `MarketRelease` type in `ReleasesMarketContext.tsx`
- `likedIds` Set in context for tracking which videos the user has liked (localStorage backed)
- `likeRelease(id)` function in context
- New `ReleasesPage.tsx` implementing a Vine/early-TikTok-style vertical snap scroll feed
- `VideoFeedItem` component: full-screen video, muted by default, tap to toggle sound, autoplay on intersect
- Heart button overlay with animation on tap
- Creator username overlay (bottom-left)
- Like count overlay (bottom-right)
- IntersectionObserver-based autoplay: only the visible video plays, others pause
- Preload the next video for smooth scrolling
- `scroll-snap-type: y mandatory` CSS on feed container
- Each video fills the viewport (minus top nav ~64px and bottom nav ~68px) with small horizontal padding (16px each side) and rounded corners (16px)

### Modify
- `ReleasesMarketContext.tsx`: add `likes: number` field to `MarketRelease` interface; backfill to 0 in `loadReleasesFromStorage`; add seed data likes values; add `likeRelease` to context
- `ReleasesPage.tsx`: complete rewrite — remove all pack grid UI, filters, market toggle, ticker, hashtags, hot packs, safe view toggle, price/supply display, buy button; implement vertical snap scroll feed

### Remove
- Pack price display
- Pack supply / remaining count
- Preview clip button / expand modal
- Market toggle (auction tab)
- Pack filters
- Hashtags section
- Hot Packs section
- Newest moments toggle
- Safe view toggle (keep explicit filtering logic silently — filter out explicit content without UI)
- Buy Pack button and BuyPacksModal references from Releases tab
- Ticker bar
- Countdown timers
- Progress bars
- Trending signals

## Implementation Plan

1. **ReleasesMarketContext**: Add `likes: number` to `MarketRelease` interface. Add `likeRelease(id: string) => void` to context. Add liked tracking via localStorage. Backfill `likes` in `loadReleasesFromStorage`. Add seed likes values to seed data.

2. **ReleasesPage rewrite**:
   - Remove all existing UI components and imports no longer needed
   - Outer container: `height: 100%`, `overflow-y: scroll`, `scroll-snap-type: y mandatory`, padding 0
   - Each `VideoFeedItem`: height = `calc(100dvh - 64px - 68px)`, `scroll-snap-align: start`, horizontal padding 16px
   - Video element: width 100%, height 100%, `object-fit: cover`, `border-radius: 16px`, autoplay, loop, muted
   - IntersectionObserver: play video when ≥60% visible, pause otherwise
   - Tap on video body: toggle muted
   - Overlay (bottom-left): `@creatorName` in white, DM Sans, semibold
   - Overlay (bottom-right): heart icon + like count; tap animates heart (scale pulse) and increments like
   - Preload: `<link rel=preload>` or set `preload="auto"` on next video
   - Filter explicit content silently (no toggle shown)
   - No progress bar, no sound icon visible by default
   - Sound state indicator: small muted icon fades in/out on toggle tap only
