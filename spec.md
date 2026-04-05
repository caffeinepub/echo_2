# Minty — Bonding Curve Pricing

## Current State
- `MarketRelease` has a flat `priceUsd: number` field set at listing time and never updated.
- `packCount` (total minted) and `packsAvailable` (remaining) already exist on each release.
- Seed data uses `packCount: 100` with low `packsAvailable`.
- Release cards display `${release.priceUsd.toFixed(2)} each` (static).
- Buy modal multiplies `qty × priceUsd` (static).

## Requested Changes (Diff)

### Add
- `BONDING_CURVE_CONFIG` constant: `{ totalPacks: 300, basePrice: 10, maxPrice: 60 }`
- `calcPackPrice(packsSold, totalPacks, basePrice, maxPrice)` pure utility function using the quadratic formula
- Derived `currentPrice` computed wherever a release is rendered, using `packCount - packsAvailable` as `packsSold`
- Display on release cards: current pack price, packs sold, packs remaining
- After a successful purchase, `packsAvailable` decrements → price auto-updates on next render

### Modify
- Seed data: update `packCount` to 300 so default releases match the new config
- `ReleaseCard` price display: replace static `priceUsd` with computed `calcPackPrice(...)`
- `BuyPacksModal`: replace static `priceUsd` with computed current price at time of purchase
- `MarketRelease`: keep `priceUsd` as the initial/listed price (used as `basePrice` fallback if needed), no schema change needed — computed price is derived, not stored

### Remove
- Nothing removed; flat `priceUsd` kept as the initial base price anchor for listings that don't use the default config

## Implementation Plan
1. Add `calcPackPrice` utility and `BONDING_CURVE_CONFIG` in `ReleasesMarketContext.tsx` (exported)
2. Update seed releases to use `packCount: 300` with realistic `packsAvailable` values
3. Update `ReleaseCard` to compute and display current price, packs sold, packs remaining
4. Update `BuyPacksModal` to use computed price for per-pack cost and total
5. Ensure purchase flow decrements `packsAvailable` (already does) so price updates automatically
