# Minty — Collected + Pack Combined Screen

## Current State

The `LibraryPage` has a `Collected | Created` segmented toggle at the top.
- **Collected** tab: 2-column NFT collectible grid with filter chips (All | Photos | Videos | Listed). Tapping a tile navigates to AssetDetailPage.
- **Created** tab: shows user-created sets, cards, and listings with a Mint Moment banner.

The Minty Pack purchase experience (pack artwork, buy button, supply info, Mint Moment modal) lives on the same Library page but is accessed via the "Mint Moment" button inside the **Created** tab.

## Requested Changes (Diff)

### Add
- New `PackView` section inside `LibraryPage`: large centered pack artwork, pack title, short description ("Contains 1 collectible"), price per pack ($1.00), remaining supply (50,000), and a "Buy Pack" / "Mint Moment" button.
- The `Pack` tab state replaces the `Created` tab entirely in the toggle.
- Smooth animated transition between Collected and Pack views (opacity + slight y shift via framer-motion).

### Modify
- Rename the segmented toggle from `Collected | Created` → `Collected | Pack`.
- The toggle now switches between:
  - `Collected` → shows NFT grid + filter chips (All | Photos | Videos | Listed) — unchanged.
  - `Pack` → hides filter chips entirely; shows the full pack purchase layout centered on screen.
- The Pack view should contain all the premium pack UI currently spread across the Library page (pack artwork glass pedestal, floating animation, pack title, description, price, supply, Mint Moment trigger button with modal).
- Move the `MintMomentBanner` / `MintMomentModal` trigger from the Created tab into the Pack tab view.
- Filter chips row should only be visible when `Collected` is the active tab. When `Pack` is active, the chips row is hidden (not just collapsed — fully removed from layout).

### Remove
- The `Created` tab and all its content (CreatedSetsList, CreatedCardsGrid, CreatedListingsList, MintMomentBanner in Created context).
- The `createdFilter` state and `createdFilterChips`.
- The Created tab's `ActiveTab = "created"` type — replace with `"pack"`.

## Implementation Plan

1. In `LibraryPage.tsx`:
   - Change `ActiveTab` type from `"collected" | "created"` to `"collected" | "pack"`.
   - Remove all Created tab state, content, and helpers.
   - Change toggle labels from `Collected / Created` → `Collected / Pack`.
   - Hide filter chips row entirely when `activeTab === "pack"`.
   - Add a `PackView` inline component inside LibraryPage:
     - Centered layout with premium pack card (frosted glass pedestal, floating 3D animation, pack artwork — same style already in use).
     - Pack title: "Minty Pack"
     - Description: "Contains 1 collectible"
     - Price: $1 per pack
     - Supply remaining: 50,000
     - Mint Moment button (same hasDraft logic: shows locked state when draft active, opens MintMomentModal otherwise).
   - The `AnimatePresence` / `motion.div` wrapper already in place handles transitions cleanly — keep it.
   - Ensure `MintMomentModal` and `useMomentDraft` are still wired in the Pack view.
