# Minty Set Detail Dashboard Upgrade

## Current State
SetDetailPage.tsx shows a simple set image card, a set info card with basic metadata and a completion bar, and a 2-column grid of card tiles. There is no market data, no dashboard stats, no leaderboard, and no card detail modal.

MockCatalog.ts already has all the data fields needed: tagPopulation10/9/8, totalTagPopulation, mintyTransactions, lastSalePriceUsd, averageSalePriceUsd, highestSalePriceUsd, lowestSalePriceUsd on each MockCard.

## Requested Changes (Diff)

### Add
- Set Overview Card: set image, set name, category badge, year, set code, total cards, supported status badge — replacing the separate image and info cards
- Set Stat Grid: 8 compact dashboard panels computed from card data: Set Volume, Transactions, Active Cards, Avg Sale, Highest Sale, Total Pop, Leader Card, Floor Price
- Analytics Panels Row: Volume Trend, Grade Distribution, Most Active Cards panels — elegant placeholder state if no real data
- Ranked Card Leaderboard: replaces the 2-column grid with a leaderboard sorted by mintyTransactions volume desc, transaction count desc, lastSalePriceUsd desc. Each row shows rank, image, name, number, rarity, volume, transactions, last sale, TAG 10 pop, mini trend indicator. Top 3 rows have slight emphasis.
- Card Detail Modal: slide-up sheet opened on leaderboard row tap, showing: large card image, identity (name/number/rarity/set/category), Population Data section (TAG 10/9/8/total), Minty Market Data section (volume, transactions, high/low/avg/last sale), Recent Sales Feed (mock sample rows with date/price/grade/payment/ref), Doppler Placeholder section (velocity, liquidity, supply pressure, price movement score, trend signal)
- Empty states: if no card data, show dashboard structure with placeholder values and "No Minty market data yet" message

### Modify
- SetDetailPage.tsx: full rewrite to implement dashboard layout
- Visual style: soft mint pastel gradients, frosted panel feel, rounded cards, subtle glow borders, white/very light background in light mode

### Remove
- Simple 2-column card grid
- Separate cover image card and set info card (replaced by unified Set Overview card)
- Placeholder slot grid for uncollected cards (replaced by leaderboard)

## Implementation Plan
1. Rewrite SetDetailPage.tsx with dashboard layout sections
2. Compute set-level aggregates from cards array (totalVolume, totalTx, uniqueTraded, highestSale, avgSale, mostActiveCard, totalPop, floor)
3. Build SetOverviewCard component inline (image + identity + badges)
4. Build SetStatGrid component inline (8 compact mint panels)
5. Build AnalyticsPanels component inline (3 chart placeholder panels with elegant empty states)
6. Build CardLeaderboard component inline (ranked list, top 3 emphasis)
7. Build CardDetailModal component inline (full slide-up sheet with all sections)
8. Apply Minty soft mint aesthetic throughout: mint pastel gradients, rounded-2xl, thin mint borders, subtle glow, mobile-first responsive layout
