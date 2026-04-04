# Minty — Purchase Flow for Releases Tab

## Current State

The Releases tab shows marketplace listings of sealed Minty packs. When a user taps a release card, a bottom sheet opens (`BuyPackSheet` component inline in `ReleasesPage.tsx`) showing the release cover, title, countdown, price, and a single "Buy Pack" button. Tapping the button buys exactly 1 pack and adds it to Collection. There is no quantity selection, no payment method choice, no slide-to-confirm interaction, and no per-set rate limiting.

`ReleasesMarketContext` has a `buyPack(releaseId)` function that decrements `packsAvailable` by 1. `CollectionContext` has `addSealedPacks(packs[])` which can receive multiple packs at once.

## Requested Changes (Diff)

### Add
- `BuyPacksModal` component: a centered immersive modal (not bottom sheet) with:
  - Set cover image/video at top in 4:5 ratio with gradient overlay
  - "Buy Packs" title + collectible contents subtext (9 photos Common, 1 video Rare)
  - Quantity selector: pill buttons for 1–5 packs, with per-set hourly rate limit (5 packs/hr)
    - Rate limit tracked in localStorage keyed by `setName + hourWindow`
    - Helper text: "Limit: 5 packs per hour per set" or "You can buy X more pack(s) in this hour"
    - Quantities above remaining allowance are disabled
  - Payment method selector: USDC (default), BTC, ETH, SOL as rounded pill buttons (single select)
  - Dynamic price display: `{qty} packs × ${price} = ${total}`
  - Slide-to-Buy interaction: draggable knob across mint-gradient track, triggers purchase on reaching end
  - Success state: glow pulse + bounce animation, checkmark icon, "Packs added to your Collection" message
- `buyPacks(releaseId, qty)` function in `ReleasesMarketContext` to decrement by quantity
- Multi-pack Collection creation: create `qty` SealedPack entries with unique IDs and numbers at purchase time

### Modify
- `ReleasesPage.tsx`: replace `BuyPackSheet` (existing single-buy bottom sheet) with new `BuyPacksModal`
- Release card tap handler: opens new modal instead of old sheet
- `ReleasesMarketContext`: add `buyPacks(releaseId, qty)` alongside existing `buyPack`

### Remove
- Old `BuyPackSheet` component (replaced by the new modal)

## Implementation Plan

1. Add `buyPacks(releaseId: string, qty: number)` to `ReleasesMarketContext` and its interface
2. Create `BuyPacksModal` as a standalone component in `ReleasesPage.tsx` with:
   - Rate-limit logic via localStorage (`minty_purchase_limits` key)
   - Quantity pill selector (1–5, disabled above limit)
   - Payment method pill selector (USDC default)
   - Dynamic price display
   - Slide-to-Buy drag interaction with pointer events
   - Success animation state
3. Replace `BuyPackSheet` usage in `ReleasesPage` with `BuyPacksModal`
4. On confirmed purchase: call `buyPacks`, generate N SealedPack objects, call `addSealedPacks`
5. Each pack gets a random collectible assignment (90% photo, 10% video) with correct numbering
