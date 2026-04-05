# Minty — BTC-Only Wallet

## Current State
The wallet modal in `TopBar.tsx` contains an `ASSETS` array with 4 tokens: USDC, BTC, ETH, SOL. The total balance is the sum of all four. Each asset renders an `AssetRow` with Receive/Send/Info pills. There is no live price feed; all prices are hardcoded.

## Requested Changes (Diff)

### Add
- Live BTC/USD price fetch via `https://api.coinbase.com/v2/prices/BTC-USD/spot` (polled every 60s, cached in state)
- USD equivalent line below BTC balance: `≈ $1,246.57 USD`
- `btcToUsd(btcAmount, btcPrice)` helper

### Modify
- `ASSETS` → replace with a single `BTC_ASSET` constant (no USDC, ETH, SOL)
- Total balance display → shows only BTC USD equivalent (live price × BTC balance)
- `AssetRow` → add `≈ $X,XXX.XX USD` line below balance
- Info view → shows BTC price and 24h change from live feed
- Send/Receive views → unchanged structurally, scoped to BTC only
- All transaction references (mint fee, pack purchase, auction fee, bids) → described as BTC in wallet modal copy

### Remove
- All multi-token ASSETS array entries (USDC, ETH, SOL)
- Token selector logic (there was none, but ensure no multi-asset rendering path remains)
- Hardcoded stale prices; replace with live-fetched BTC price

## Implementation Plan
1. Replace `ASSETS` array in `TopBar.tsx` with single `BTC_ASSET` object
2. Add `useBtcPrice()` hook inside `TopBar.tsx` that fetches Coinbase spot price on mount and every 60s
3. Update `WalletModal` to use live BTC price for total balance and per-asset USD display
4. Update `AssetRow` to show `≈ $X USD` line below BTC amount
5. Remove multi-asset map rendering; render a single `AssetRow` for BTC
6. Update Info panel to show live price and change (from fetched data)
