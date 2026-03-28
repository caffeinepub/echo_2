# ECHO

## Current State
The Releases tab is an editorial lineup/list view inspired by festival schedules. Each song appears as a slim row with small thumbnail, title, artist, status badge, and an expandable section for preview/minting. It uses `LineupRow` components in `ReleasesPage.tsx`.

## Requested Changes (Diff)

### Add
- YouTube/TikTok-style vertical video feed replacing the lineup view
- Horizontal scrollable category tabs at the top (All, Trending, Live Now, Upcoming, Sold Out, New, Electronic, Ambient, Hip Hop, Experimental)
- Full-width media cards with large 16:9+ artwork area as the primary focus
- Gradient overlay on media area for text readability
- Info overlay (title, artist, mint status) inside the media area
- NFT data row below media: SOL price, USD price, animated mint progress bar
- Action row: primary "Mint NFT" button (glowing purple), secondary "Play 30s" button
- Card enter-viewport animations: fade in + slight upward motion
- Like and comment buttons on each card
- Countdown timers for upcoming drops
- SOLD OUT state on cards
- Live mint count updates
- Waveform animation overlay on media area when preview is playing

### Modify
- `ReleasesPage.tsx` — full redesign replacing lineup rows with video feed cards
- Category filtering logic based on selected tab

### Remove
- `LineupRow` component and editorial lineup design
- "LINEUP" header with drop count

## Implementation Plan
1. Replace `ReleasesPage.tsx` with new video feed implementation
2. Add `CategoryTabs` component (horizontal scrollable pill tabs)
3. Add `ReleaseFeedCard` component with media area, overlay, data row, action row
4. Add waveform animation component for playing state
5. Add IntersectionObserver-based fade-in animations for cards entering viewport
6. Wire category tabs to filter `allAlbums` mock data
7. Preserve existing like/comment/mint modal logic
