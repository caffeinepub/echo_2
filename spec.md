# Minty – Library Page Collected Tab Refactor

## Current State
LibraryPage.tsx has a `Collected | Created` segmented toggle. The Collected tab shows filter chips: All | Sets | Cards | Media | Listings. Selecting "All" stacks Sets (with progress bars), Cards grid, Media grid, and Listings. Sets and Cards are card/TCG-oriented with collection progress bars and rarity badges.

## Requested Changes (Diff)

### Add
- New mock data for owned media items with: id, type (photo/video), title, creator, editionNumber (e.g. "12/100"), isListed (boolean), price (optional), duration (optional, for videos), thumbnailUrl
- Filter chips for Collected tab: `All | Photos | Videos | Listed`
- Media tile component for 2-column grid showing: thumbnail preview, Photo/Video badge (top-left), edition number (bottom-left), listed indicator dot/badge (top-right if listed), play icon overlay + duration label for videos
- Media detail view/sheet that slides up on tile tap: large preview, creator name, edition number, price if listed, "List for Sale" button, "Transfer" button, "Share" button

### Modify
- Collected tab filter chips: replace `All | Sets | Cards | Media | Listings` with `All | Photos | Videos | Listed`
- Collected tab default view (All): show only the 2-column media grid (photos + videos), no Sets section, no Cards section, no progress bars
- Photos filter: show only photo items in 2-column grid
- Videos filter: show only video items in 2-column grid  
- Listed filter: show only items with isListed=true in 2-column grid
- Remove `CollectedSetsList`, `CollectedCardsGrid` from Collected tab rendering
- Remove `MOCK_OWNED_CARDS` and `MOCK_OWNED_SETS` mock data (or keep but unused)
- Keep `Created` tab fully intact (no changes)

### Remove
- Sets section from Collected tab
- Cards section from Collected tab
- Collection progress bars from Collected tab
- `sets` and `cards` filter chips from Collected tab
- `CollectedSetsList` and `CollectedCardsGrid` usage in Collected tab rendering

## Implementation Plan
1. Replace `MOCK_OWNED_MEDIA` with richer mock data (6-8 items) including type, creator, editionNumber like "12/100", isListed, price, duration for videos
2. Update `FilterType` for Collected to `"all" | "photos" | "videos" | "listed"` (keep separate type from Created which still uses old filter set)
3. Update filter chips rendered for Collected tab to: All | Photos | Videos | Listed
4. Build new `CollectedMediaGrid` that accepts filtered items and renders 2-column grid with:
   - Square-ish tiles with thumbnail fill
   - Photo/Video badge top-left (mint green for Photo, subtle blue-tint for Video)
   - Edition number bottom-left overlay (e.g. "12/100")
   - Listed indicator top-right (subtle mint dot or "Listed" pill)
   - Video tiles: semi-transparent play icon centered, duration label bottom-right
5. Build `MediaDetailSheet` component: slide-up modal with large preview, creator, edition, price (if listed), three action buttons (List for Sale, Transfer, Share)
6. Wire tile tap to open detail sheet with selected item
7. Update `renderCollectedContent()` to use only media grid with new filters
8. Keep Created tab and all its sub-components completely unchanged
