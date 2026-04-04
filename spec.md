# Minty — Releases Page Media Mode Redesign

## Current State

The `ReleasesPage.tsx` is a single-mode marketplace feed showing collectible slab listing cards. It has:
- Filter tabs: Most Viewed / New / Minted
- Horizontal ticker showing recent transactions
- Listing cards with TAG grade, price, Buy/Offers buttons, preferred payment badge
- Buy/Offer modal with payment rail selection
- Light/dark theme support
- No media content modes

## Requested Changes (Diff)

### Add
- Top-level segmented toggle: **Market** | **Media** (pill-style, rounded, soft shadow)
- **Media** mode with a secondary sub-toggle: **Photos** | **Videos**
- **Photos** sub-mode: 2-column masonry/grid feed of photo post cards
  - Each card: large image preview (dominant), creator name, price badge, media type badge (PHOTO), subtle Buy button, optional stats (views/likes)
  - Mock data: 12 photo posts with varied aspect ratios for masonry effect
- **Videos** sub-mode: vertical immersive swipe feed (TikTok/Reels style)
  - Each video fills most of the screen height
  - Bottom overlay with: creator name, caption/title, price, edition/supply info, Buy + Offer action buttons
  - Swipe-up/down to navigate between videos (touch events or scroll snapping)
  - Mock data: 6 video posts
- Smooth CSS transitions when switching between Market/Media and Photos/Videos toggles
- Mock data types: `PhotoPost` and `VideoPost` interfaces

### Modify
- `ReleasesPage.tsx`: Wrap existing content in a `Market` mode container; add `Media` mode alongside it
- The top area of the page gets the new segmented toggle inserted above the ticker/filters
- Page state: `activeMode: 'market' | 'media'` and `mediaSubMode: 'photos' | 'videos'`

### Remove
- Nothing is removed; Market mode is preserved completely

## Implementation Plan

1. Add `activeMode` and `mediaSubMode` state to `ReleasesPage`
2. Add `ModeToggle` component: pill segmented control for Market/Media, styled with rounded container, soft shadow, smooth active indicator
3. Add `MediaSubToggle` component: Photos/Videos secondary toggle, shown only when Media is active
4. Add `PhotoPost` interface and `MOCK_PHOTOS` array (12 items, varied heights for masonry)
5. Add `PhotosGrid` component: 2-column CSS masonry-style grid using `columns` CSS property or two flex columns; each card shows image, creator, price, badge, buy button, stats
6. Add `VideoPost` interface and `MOCK_VIDEOS` array (6 items)
7. Add `VideosSwipeFeed` component: full-height scroll-snap container; each video slide fills screen height with a video element (or colored placeholder) plus bottom overlay
8. Wire toggle state to conditionally render: Market content OR (Photos/Videos based on submode)
9. Apply smooth `opacity` + `translateY` transitions on mode switch using CSS transitions
10. Ensure bottom nav and header are not affected (they live outside this component)
11. All new components use Minty visual language: off-white backgrounds, mint accents (#10b981 / oklch mint), rounded corners, soft shadows, clean typography
