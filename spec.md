# Minty — Live Offer Functionality

## Current State
- `ReleasesPage.tsx` contains a `BuyOfferModal` with two stages: "choose" (Buy now / Make offer) and "payment" (a basic payment chip selector).
- The Buy Now flow has no price display or crypto conversion — just a payment chip selector and a confirm button.
- The Make Offer flow does not exist — tapping "Make offer" goes to the same basic payment page.
- The `SlabDetailSheet` has no Live Offers section.
- There are no mock offers or offer state management.

## Requested Changes (Diff)

### Add
- **Buy Now flow** (new stage in BuyOfferModal): display listing price in USD + preferred payment chip, show 4 payment chips (USDC, BTC, ETH, SOL), compute and display estimated crypto amount using mock price rates (e.g., $620 ≈ 0.23 ETH), and a Confirm Purchase button.
- **Make Offer flow** (new stage): USD amount input field, currency selector chips (USDC/BTC/ETH/SOL), expiration selector (1h/6h/24h/3d), live crypto conversion preview (≈ X ETH), Submit Offer button. On submit, add offer to per-slab mock state.
- **Live Offers section** in `SlabDetailSheet`: shows all submitted offers for that slab sorted highest → lowest USD, each row showing USD amount + currency chip + expiration status ("Active" or "Xh left").
- **Mock offer state**: a React context or local state map keyed by slab id, initialized with 2–3 seeded offers per slab. New submitted offers prepend to the list.
- **Mock crypto rates**: USDC=1, BTC≈65000, ETH≈2700, SOL≈145 (USD per coin).

### Modify
- `BuyOfferModal`: replace the existing single "payment" stage with two distinct stages: `"buy"` and `"offer"`, each with full implementations per the spec above. Keep the existing "choose" stage and its two action buttons.
- `SlabDetailSheet`: add a "Live Offers" panel below the existing sections.
- `BuyOfferModal` needs to accept an `onSubmitOffer` callback so submitted offers can be stored.

### Remove
- The existing placeholder "payment" stage that handled both Buy Now and Make Offer identically.

## Implementation Plan
1. Add mock crypto rates constant and offer type at top of `ReleasesPage.tsx`.
2. Add offer state map (`Record<string, Offer[]>`) at page level initialized with seeded offers.
3. Update `BuyOfferModal` props to include `onSubmitOffer(slabId, offer)`.
4. Replace the existing `"payment"` stage with `"buy"` stage (price display, payment selector, crypto conversion, confirm button) and `"offer"` stage (USD input, currency chips, expiration chips, conversion preview, submit button).
5. Wire `handleChoose` to set the correct stage.
6. Add `LiveOffersSection` component displaying sorted offers with currency chip + expiration.
7. Pass `offers` and `onBuyOffer`/`onSubmitOffer` correctly through `SlabDetailSheet` and the page root.
8. Keep all Minty design tokens — soft mint chips, rounded panels, clean spacing, no harsh colors.
