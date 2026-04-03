# Minty — Mint Moment Flow

## Current State
The LibraryPage has a "Buy Pack" button that directly triggers the pack opening animation (handleBuyPack). No modal or minting concept exists yet. App.tsx manages view state as a union type; all page routing is done via setView.

## Requested Changes (Diff)

### Add
- `MintMomentModal` component: mobile-first modal that slides up with fade-in animation, explains the minting process
  - Title: "Mint a Moment"
  - Description paragraph
  - Details bullet list (9 photo cards, 1 video card, 5 packs, etc.)
  - Mint price: $1.00
  - Process steps (1–4, visual numbered list)
  - Payment pills: USDC (default selected), BTC, ETH, SOL
  - Helper text for non-USDC currencies
  - Slide-to-Start-Mint control (custom draggable thumb on mint track, completes at ~90%)
  - Close button (X) top-right
- `CaptureMomentPage` component: new page shown after slider completes
  - Basic placeholder UI with back button and title "Capture Moment"
- New view type `{ type: "capture-moment" }` in App.tsx

### Modify
- `LibraryPage`: rename "Buy Pack" button text to "Mint Moment"; on click, open MintMomentModal instead of calling handleBuyPack directly
- `App.tsx`: add `capture-moment` view type, render CaptureMomentPage when active; pass handler to LibraryPage

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/components/MintMomentModal.tsx` with all modal content and slide control
2. Create `src/frontend/src/pages/CaptureMomentPage.tsx` as a placeholder page
3. Update `LibraryPage.tsx` to rename button and open modal
4. Update `App.tsx` to add capture-moment view type and pass navigation handler down
