# Minty — Pack Opening Interface

## Current State
The Library tab (`LibraryPage.tsx`) shows a set collection manager: empty state, a plus button to add sets, a modal to select sets, and a set detail view. It uses dark Minty styling with mint green accents.

## Requested Changes (Diff)

### Add
- New `PackOpeningPage.tsx` component replacing LibraryPage entirely
- Three states managed internally: `idle` (pack shown), `opening` (transition), `revealed` (card shown)
- Pack card UI: large centered card with soft off-white background (#F7F6F2), rounded corners, subtle shadow, centered text ("Minty Pack", "Contains 1 collectible", "$1 per pack"), supply remaining text below
- Buy Pack button: rounded rectangle, dark text (#111111) on soft gray background (#E8E8E6), no gradients, no glow
- Transition animation: screen dims slightly, pack slides/fades out, collectible card slides in from right to center (0.6–1s, smooth easing, CSS/framer-motion)
- Revealed card UI: large centered card with off-white background, collectible name and rarity below (e.g. "Mint Chip" / "Common")
- Two post-reveal buttons: "Open Another" (resets to idle) and "View Library" (placeholder/navigates)
- Light background forced for this page: #F7F6F2 warm white, text #111111, secondary text #6B6B6B, accent #E8E8E6
- Mock collectibles pool (5–8 items) with name + rarity for random reveal

### Modify
- `App.tsx`: replace `LibraryPage` import/usage with `PackOpeningPage`; keep same `onBrowseReleases` prop for "View Library" button
- Library tab label in BottomNav stays as-is ("Library")

### Remove
- All set management logic (AVAILABLE_SETS, AddSetModal, SetCard, SetDetailView) from LibraryPage — the entire file is replaced

## Implementation Plan
1. Create `src/frontend/src/pages/PackOpeningPage.tsx` with three states (idle/opening/revealed), mock collectibles pool, animations using framer-motion, and the exact color scheme specified (#F7F6F2 bg, #111111 text, #6B6B6B secondary, #E8E8E6 accent)
2. Update `App.tsx` to import and render `PackOpeningPage` instead of `LibraryPage` for the library tab
3. Keep `LibraryPage.tsx` file but it will no longer be rendered (or delete and remove import)
4. Validate with typecheck + build
