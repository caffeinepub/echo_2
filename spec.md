# ECHO

## Current State
All market cap, pricing, and volume values are displayed in SOL only across the app (Discover stat cards, leaderboard rows, drop detail dashboard, releases lineup, library/NFT stats, mint prices). A custom Solana gradient icon appears inline with all SOL values.

## Requested Changes (Diff)

### Add
- A `useSolPrice` hook that fetches the live SOL → USD price (via CoinGecko public API or similar HTTP outcall) and refreshes periodically (every 60s)
- A `formatUSD` utility that formats dollar amounts cleanly: no decimals for values ≥$1 (comma-separated), 2 decimals for values <$1
- A `SolUsdValue` display component that renders SOL primary + USD secondary in two layout variants: stacked (for stat cards) and inline (for compact rows)

### Modify
- **Discover stat cards** (Total Market Cap, 24H Volume, Active Viewers, Live Releases): show USD below SOL value in smaller softer text
- **Leaderboard rows**: show USD inline after SOL — e.g. "231.4 SOL • $34,710" or as a small secondary line
- **Drop detail dashboard** (market cap card, volume card, price): stacked SOL + USD
- **Releases lineup rows**: mint price shows USD inline
- **Library/NFT detail**: any SOL price or market cap shows USD secondary
- **Mint modal / buy button**: show USD equivalent below SOL price
- No Solana logo placed next to USD values; SOL logo only accompanies the SOL figure

### Remove
- Nothing removed

## Implementation Plan
1. Add `useSolPrice` hook — fetches CoinGecko `simple/price?ids=solana&vs_currencies=usd` in frontend (fetch in useEffect, refresh every 60s), exposes `solPrice: number`
2. Add `formatUSD(usdValue: number): string` utility
3. Add `SolUsdValue` component with `variant: 'stacked' | 'inline'` prop
4. Wire `useSolPrice` at app root via context so all components share one price
5. Update Discover stat cards to use stacked variant
6. Update leaderboard rows to use inline variant
7. Update drop detail dashboard cards
8. Update releases lineup rows
9. Update library NFT stats / mint prices
10. Ensure dark and light mode text colors apply correctly to USD secondary text
