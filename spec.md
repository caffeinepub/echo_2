# Minty — Discover Page Leaderboard

## Current State

The Discover (MarketPage) page currently shows:
- 4 stat signal cards (Total Volume, 24H Volume, Total Transactions, Live Users)
- Time filter pills: 24H, 1W, 1M, 1Y, ALL
- A ranked list of the top 10 **individual luxury item completed sales** (Rolex, iPhone, Birkin bag, etc.) from mockSales.ts
- RankRow components showing thumbnail, title, category, price, and time ago
- No preview media, no set structure, no collector counts, no sales count

The mock data contains luxury/fashion/watch items unrelated to Mint Moment sets.

## Requested Changes (Diff)

### Add
- New data model: `MintMomentSetRank` — represents a ranked Mint Moment set with: id, rank, title, creator, totalVolume, salesCount, nftTrades, uniqueCollectors, recentActivityScore, previewClipUrl (optional), coverImageUrl, description, totalPacks, remainingPacks, pricePerPack, recentSales array
- Weighted scoring function to compute rank: totalVolume (40%) + salesCount (25%) + nftTrades (15%) + uniqueCollectors (15%) + recentActivityBoost (5%)
- Filter tabs: All Time, 24H, 7D, 30D (default: All Time)
- Top 100 ranked set rows, each showing: rank number, looping preview clip (1–2s, 4:5 ratio, muted), set title, creator name/wallet, total volume, number of sales, number of collectors
- Set detail sheet/modal: preview clip, set description, total packs, remaining packs, price per pack, recent activity list, Buy Packs button
- Leaderboard header text ("Top 100 Mint Moment Sets")
- New mock data file: `store/mockDiscoverSets.ts` — 100 Mint Moment sets with realistic names and stats

### Modify
- `MarketPage.tsx` — completely replace the luxury-item rank list with the new Mint Moment set leaderboard. Keep stat signal cards. Replace time filter options with All Time / 24H / 7D / 30D. Replace RankRow with new SetRankRow. Add SetDetailSheet.
- `store/mockSales.ts` — keep as-is (used for ticker elsewhere if any), but Discover no longer reads from it

### Remove
- MOCK_SALES luxury item data from Discover display
- RankRow component showing individual sale rows with luxury items
- `getTopSoldItems` usage in MarketPage

## Implementation Plan

1. Create `src/frontend/src/store/mockDiscoverSets.ts` with 100 mock Mint Moment sets, each with weighted scoring fields
2. Add weighted scoring utility function and filter logic by time window
3. Rewrite `MarketPage.tsx`:
   - Keep stat signal cards at top
   - Replace time filters with All Time / 24H / 7D / 30D
   - Add leaderboard header
   - New `SetRankRow` component: rank badge, 4:5 preview clip loop or cover image, set title, creator, volume/sales/collectors stats
   - New `SetDetailSheet` bottom sheet: preview clip, description, pack stats, recent activity, Buy Packs CTA
4. Validate and build
