# ECHO

## Current State
- Discover (MarketPage) shows albums as horizontal list rows with small circular artwork, rank, title, metrics
- Tapping circular artwork toggles 30s audio preview
- Clicking album navigates to MarketDetailPage (full page)
- No flip interaction exists on Discover
- TOP_ALBUMS lacks total_supply field

## Requested Changes (Diff)

### Add
- DiscoverAlbumModal: overlay modal with square album art, title, artist, edition count, market cap, supply progress bar (3px gradient), recent txn count, preview button, buy button. Owned badge if owned.
- DiscoverAlbumCard: flippable card replacing list rows in 2-col grid. Front: artwork + glow + title + artist + edition if owned + ambient gradient. Back: 3-col MCAP|SUPPLY|TXNS grid. Tap anywhere flips (Y-axis 280ms ease-in-out).
- Tap to flip hint: small uppercase tracking-[0.12em] opacity 0.45, fades after first flip.
- Flip affordances: rotating-arrow icon (opacity 0.35), parallax tilt 2-3deg on hover, one-time shimmer on load.
- total_supply field in TOP_ALBUMS.

### Modify
- MarketPage.tsx: replace AlbumRow list with DiscoverAlbumCard grid. View button on card back opens modal.
- App.tsx: add discoverModalAlbumId state, render DiscoverAlbumModal overlay.
- TOP_ALBUMS: add total_supply per entry.

### Remove
- MarketDetailPage as primary Discover click action (replaced by modal).

## Implementation Plan
1. Add total_supply to TOP_ALBUMS in MarketPage.tsx
2. Create src/frontend/src/components/DiscoverAlbumModal.tsx
3. Create DiscoverAlbumCard inside MarketPage.tsx with CSS flip, shimmer, tilt, affordance icon
4. Replace AlbumRow with DiscoverAlbumCard in 2/3-col grid
5. Update App.tsx with discoverModalAlbumId state and DiscoverAlbumModal render
6. Wire preview button to AudioPlayerContext, buy button to MintModal
7. Apply color rules: #3DDC97 positive, #FF6B6B negative, #EDEDED neutral, #7A7A7A labels
8. CSS animations: shimmer sweep, spin for arrow icon
