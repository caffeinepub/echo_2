# Minty — Buy Packs Modal: BTC-Only Payment

## Current State

The `BuyPacksModal` in `ReleasesPage.tsx` has:
- A `PaymentMethod` type with four options: `"USDC" | "BTC" | "ETH" | "SOL"`
- A `PAYMENT_METHODS` array with all four options
- A `payment` state defaulting to `"USDC"`
- A multi-button "Pay with" selector rendered with `PAYMENT_METHODS.map(...)`
- A price summary showing USD total with the selected payment ticker as a small suffix label
- Slider text: generic confirmation

No live BTC price conversion exists in ReleasesPage.

## Requested Changes (Diff)

### Add
- A `useBtcPriceForModal` hook (inline, same pattern as `TopBar.tsx`) that fetches live BTC/USD spot price from Coinbase
- BTC conversion display: `≈ 0.00015 BTC` beneath the USD total
- A locked "PAY WITH / Bitcoin (BTC)" label section (static, non-interactive pill)
- Store `usdPrice`, `btcAmount`, and `btcPrice` in `handleConfirmPurchase` logic

### Modify
- Remove `PaymentMethod` type and `PAYMENT_METHODS` array
- Remove `payment` state
- Replace multi-button payment selector with a single locked BTC label/pill
- Price summary: keep `{qty} packs × $X.XX` as primary, add `≈ X.XXXXX BTC` as secondary line
- Slider label: `"Slide to confirm purchase"` (already correct, confirm no change needed)

### Remove
- `PaymentMethod` type
- `PAYMENT_METHODS` constant
- `payment` useState
- The `{PAYMENT_METHODS.map(...)}` button group rendering
- The `{payment}` ticker suffix in price summary

## Implementation Plan

1. Add a `useBtcPriceInModal` hook at the top of `ReleasesPage.tsx` (after existing helpers) that fetches from Coinbase spot endpoint, caches last known price, refreshes every 60s
2. In `BuyPacksModal`: call `useBtcPriceInModal()` to get live BTC price
3. Remove `PaymentMethod` / `PAYMENT_METHODS` / `payment` state
4. Replace the multi-button "Pay with" section with a static label + locked BTC pill
5. In price summary block: keep USD line, add BTC equivalent line below
6. Pass `btcAmount` to `handleConfirmPurchase` and log/store alongside USD price
