# ECHO

## Current State
The Releases tab renders a 2-column grid of compact song tiles (`ReleaseTile`). Each tile shows square artwork, song title, artist, edition count, mint price, status text, and a small Buy button. The data model (`Song`) already supports `mintOpensInMs`, `isSoldOut`, `editions_in_circulation`, `supply`, and `mintPrice`. Mock data has 2 songs (Fragments live, Charcoal sold out). The MintModal handles the full mint flow.

## Requested Changes (Diff)

### Add
- `likes` and `comments` fields to the `Song` data model (mock values)
- A new `SongFeedCard` component: full-width vertical card with large artwork, song info, 30s preview player, like button with live count, comment button, mint status (X/Y minted), countdown timer for upcoming drops, and Buy/Mint button
- `CommentsModal` component: slide-up panel showing comment list (wallet address, text, timestamp) and a comment input field
- Social state management: local `likes` map and `comments` map (keyed by song id) with optimistic updates
- Countdown timer hook (already exists, reuse)
- Sold Out badge overlay on artwork
- Auto-live like/mint count simulation (increments every few seconds for realism)

### Modify
- `ReleasesPage`: replace 2-column grid with a vertical scrolling single-column feed of `SongFeedCard` components, newest first
- `songs.ts`: add `likes`, `comments` array, and a 3rd upcoming song (future `mintOpensInMs`) to demo countdown state
- Remove the old `ReleaseTile` component

### Remove
- Grid layout in ReleasesPage
- `ReleaseTile` component
- Any tracklist or multi-track references in Releases context

## Implementation Plan
1. Extend `Song` type with `likes: number` and `comments: SongComment[]`
2. Add 3rd mock song with `mintOpensInMs > 0` for countdown demo
3. Build `CommentsModal` (slide-up, shows comments, allows adding a new one)
4. Build `SongFeedCard` with: large artwork (aspect-square), play preview button, like/comment action row, mint supply bar, countdown or Buy button
5. Replace `ReleasesPage` body with vertical scroll feed using `SongFeedCard`
6. Wire local state for likes/comments with optimistic updates and subtle live count simulation
7. Validate and fix any type errors
