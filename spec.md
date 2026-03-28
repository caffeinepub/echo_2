# ECHO

## Current State
ReleasesPage.tsx renders a vertical feed of large full-bleed song cards (`SongFeedCard`). Each card:
- Shows full-width square artwork at the top
- Song title + artist below
- Preview progress bar
- Like/comment action row
- Mint info section (countdown / minted count / buy button)
- Full-width `<motion.article>` separated by thin dividers

The result is heavy, card-like, and feels like an NFT drop grid.

## Requested Changes (Diff)

### Add
- `LineupRow` component: a compact horizontal row (not a full card)
- Small square artwork thumbnail (48–56px) on the left
- Song title (bold, white) + artist name (muted) stacked in center column
- Status badge (Upcoming / Live / Sold Out) on the right
- Countdown timer displayed inline when status is Upcoming: "Mint opens in HH:MM:SS"
- Minted count displayed inline when status is Live: "87 / 150 minted"
- Tap-to-expand accordion behavior: tapping a row reveals an expanded panel below it
- Expanded panel contains: preview play/pause button (30s), like button with count, comment button with count, mint price + mint button
- Thin horizontal rule separating rows (very subtle, low opacity)
- A page header/section label: e.g. "DROPS" or "LINEUP" in small caps, editorial style

### Modify
- Remove `SongFeedCard` component entirely
- Remove full-width artwork display from the feed view (artwork only shows as small thumbnail)
- Replace heavy card layout with slim lineup rows
- Keep all existing state logic (likes, comments, mint, countdown, play timer) — just move it into the new row + expand panel structure
- Keep `CommentsModal` and `MintModal` integrations intact

### Remove
- Full-width artwork panel
- Preview progress bar from the main card view (move to expanded state)
- Heavy card container styles (borders, background panels, large padding blocks)

## Implementation Plan
1. Replace `SongFeedCard` with a new `LineupRow` component in `ReleasesPage.tsx`
2. `LineupRow` default state: `[thumbnail] [title + artist] [status/count/timer]` in a single horizontal row
3. Expanded state (toggled on row tap): slides open a detail panel beneath the row with play controls, like/comment, price, and buy button
4. Use `AnimatePresence` + `motion.div` for the expand/collapse animation (smooth height, opacity)
5. Status column logic:
   - Upcoming: amber label + countdown timer line below
   - Live: green dot + "XX / YY minted" line
   - Sold Out: muted red/white label
6. Keep all existing state hooks (likesMap, mintedMap, commentsMap, playingId, likeTimer, mintTimer)
7. Section header at top: small-caps editorial label (e.g. "LINEUP" or "DROPS") with a thin rule
8. Dark premium styling: no heavy box shadows, no rounded card panels, minimal borders, generous row height (~72–80px), editorial typography
