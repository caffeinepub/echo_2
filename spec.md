# ECHO

## Current State
ECHO is a music collectibles platform built around Albums with multi-track lists. The data model (`albums.ts`) has an `Album` interface with a `tracks: Track[]` array. Pages like `AlbumPlayerPage.tsx` render full track lists with prev/next controls, lock icons per track, and "Track Dominance" analytics. `ReleasesPage.tsx` displays album grid cards with album-level data. `MarketPage.tsx` and `MarketDetailPage.tsx` also reference album/track concepts.

## Requested Changes (Diff)

### Add
- New `Song` interface replacing `Album`: `{ id, collectionName, title, artist, artworkSrc, supply, userEdition, preview_url, full_url, floorPrice, lastSoldPrice, owners, minted, isSoldOut, mintOpensInMs, editions_in_circulation, volume_24h_sol, mintPrice, nft_mint_address, marketCap, signalStrength }`
- `SONGS` export (rename from `ALBUMS`) with same 2 mock entries, titles become the song title (no sub-tracks)
- New `SongDetailPage` replacing `AlbumPlayerPage`: layout = cover artwork → song title → artist → stats row (Market Cap, 24H Volume, Edition Supply, Collectors) → ECHO SIGNAL waveform section → Listen button (preview) → Collect button (buy edition)
- Animated waveform component reused from existing ECHO SIGNAL pattern

### Modify
- `data/albums.ts` → rename to `data/songs.ts`, remove `Track` interface, remove `tracks` field, rename `Album` → `Song`, rename `ALBUMS` → `SONGS`
- `ReleasesPage.tsx` → update imports to use `Song`/`SONGS`; tile shows song title, artist, edition supply, price; remove any track count references
- `LibraryPage.tsx` → update imports; remove track list rendering; show song as single playable item
- `MarketPage.tsx` and `MarketDetailPage.tsx` → update imports; remove track list sections; rename "Album" labels to "Song"
- `AlbumPlayerPage.tsx` → replace with `SongDetailPage.tsx`: remove track list, prev/next track controls, loop button, track dominance section; replace with Listen + Collect buttons and waveform signal
- `MintModal.tsx` → update any "album" labels to "song"
- `AudioPlayerContext.tsx` → update track references to work with single-song model
- `App.tsx` → update routing from AlbumPlayerPage to SongDetailPage
- `hooks/useMockData.ts` → update to use SONGS
- All UI text: "Album" → "Song", "Tracks" → removed, "Track list" → removed

### Remove
- `Track` interface
- `tracks` array from data model
- Track list section UI in all pages
- Prev/Next track controls (SkipBack/SkipForward) in player
- Track Dominance analytics section
- Loop button (Repeat icon)
- "Track" or "Tracks" heading anywhere in UI

## Implementation Plan
1. Rename/rewrite `data/albums.ts` → `data/songs.ts` with `Song` interface and `SONGS` export
2. Rewrite `AlbumPlayerPage.tsx` → `SongDetailPage.tsx` with new layout: artwork, title, artist, stats, waveform, Listen + Collect buttons
3. Update `ReleasesPage.tsx` to use Song/SONGS, remove track references
4. Update `LibraryPage.tsx` to use Song/SONGS
5. Update `MarketPage.tsx` and `MarketDetailPage.tsx` to use Song/SONGS, remove track list sections
6. Update `MintModal.tsx` text
7. Update `AudioPlayerContext.tsx` for single-song model
8. Update `App.tsx` routing
9. Update `hooks/useMockData.ts`
