# Minty – Library Page Redesign

## Current State

The Library page (`src/frontend/src/pages/LibraryPage.tsx`) is currently a premium pack-opening interface (786 lines). It shows:
- A large animated PackCard hero with a floating/rotating 3D pack
- A "Mint Moment" button (was "Buy Pack") that opens the MintMomentModal
- A "locked" state when a Moment draft is in progress showing "Finish Current Moment"
- A card reveal animation after opening (collectible slides in)
- "Open Another" / "View Library" post-reveal buttons

The page has NO collection display, NO tabs, NO filter chips.

The ReleasesPage (`src/frontend/src/pages/ReleasesPage.tsx`) has:
- A top ModeToggle (Market | Media) — rounded pill segmented control
- Filter chips row (sticky)
- Card grid with white cards, subtle shadows, mint accents
- Theme-aware (isDark) using `useTheme()` hook
- OKLCH color tokens: accent `oklch(0.70 0.18 160)`, bg near-black dark mode, white light mode

## Requested Changes (Diff)

### Add
- `Collected | Created` segmented toggle at the top of the Library page (same pill style as ReleasesPage ModeToggle)
- **Collected tab** with filter chips: All | Sets | Cards | Media | Listings
  - Cards view: 2-col grid, card preview image, edition number, rarity badge, set name
  - Sets view: set cover image, set name, progress bar, "7/10 collected" indicator
  - Media view: 2-col visual grid of purchased photo/video thumbnails with type badge
  - Listings view: cards listed for sale with price, preferred payment currency, offer count
  - All view: combined display of owned items
- **Created tab** with filter chips: All | Sets | Cards | Media | Listings
  - Sets view: container card per created set — cover image, title, asset count, supply ("100 editions"), sold count, remaining count
  - Cards view: grid of individual assets in sets with edition number and listing status pill
  - Listings view: active listings with price, currency, views count, "Edit Listing" button
  - Media view: uploaded photo/video assets
  - All view: combined display
- Mock data for all views (frontend-only, no backend required)
- Smooth tab/filter transition (opacity fade)

### Modify
- Keep the existing pack opening UI (PackCard, MintMomentModal, draft lock logic) — move it to appear **below** or as a secondary section, OR keep the "Mint Moment" button as a sticky action within the Created tab or as a floating action
- Actually: replace the full-page centered pack UI as the primary Library view. The pack opening / Mint Moment flow should be accessible via a button within the page (e.g. a "+ Mint Moment" button inside the Created tab), not the entire page
- LibraryPage props (`onCaptureMoment`, `onBrowseReleases`, `onAlbumClick`) remain intact

### Remove
- The full-page centered layout that makes the pack card the only content
- The "View Library" button that just resets the pack state (no longer needed since the collection IS the library now)

## Implementation Plan

1. **Keep** all existing imports, MintMomentModal, useMomentDraft, MomentDraft logic — just reposition them
2. **Add** top-level `activeTab: 'collected' | 'created'` state
3. **Add** per-tab `activeFilter` state for the chip row
4. **Build** mock data interfaces and arrays:
   - `OwnedCard`: id, name, imageUrl, editionNumber, rarity, setName
   - `OwnedSet`: id, name, imageUrl, totalCards, collectedCards
   - `OwnedMedia`: id, type ('photo'|'video'), imageUrl, title, price
   - `OwnedListing`: id, name, imageUrl, price, currency, offerCount
   - `CreatedSet`: id, name, imageUrl, assetCount, supply, sold, remaining
   - `CreatedCard`: id, setName, name, imageUrl, editionNumber, listingStatus
   - `CreatedListing`: id, name, imageUrl, price, currency, views
5. **Build** segmented toggle component (reuse ReleasesPage pill style)
6. **Build** filter chips row (horizontal scroll, pill chips, mint active state)
7. **Build** grid views for each data type
8. **Keep** MintMomentModal accessible — add a "+ Mint Moment" floating or inline button in Created tab (only when no active draft)
9. **Theme-aware**: use `useTheme()`, light = soft white `#F8F8F8` bg, dark = OKLCH dark bg
10. **Validate** with lint + typecheck + build

### Design Tokens (match ReleasesPage)
- Accent: `oklch(0.70 0.18 160)` / `#1db98a`-like mint
- Light bg: `#F8F8F8` or `#F7F6F2`
- Card bg light: `#ffffff` with `box-shadow: 0 1px 4px rgba(0,0,0,0.07)`
- Border light: `rgba(0,0,0,0.07)`
- Segmented control bg light: `#f3f4f6`, active pill: `#ffffff`
- Rarity badge: color-coded (Common gray, Rare blue, Ultra Rare gold)
- Progress bar: mint fill on light gray track
- Filter chip active: mint tint bg `rgba(29,185,138,0.10)`, mint text, mint border
