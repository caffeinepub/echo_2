# Minty Set Detail Page Refactor

## Current State
SetDetailPage.tsx is a large analytics dashboard with:
- Set header card (image, name, category, year, set code)
- 8 stat panels (volume, transactions, active cards, avg sale, highest sale, floor, total pop, leader card)
- Analytics row with 3 charts (volume trend, grade distribution, market activity)
- Ranked card leaderboard
- Card detail modal with population, market data, recent sales, Doppler placeholder

## Requested Changes (Diff)

### Add
- 2 market signal stat cards: SET VOLUME and ACTIVE LISTINGS (soft mint pastel, rounded, light gradient border)

### Modify
- Keep set header card as-is (image, name, category, year, set code)
- Simplify card rows to show: image, card name, card number, total volume, active listings count
- Card detail modal remains but empty/placeholder until populated later
- Section title: "Cards in This Set" with subtitle "Ranked by highest Minty volume"

### Remove
- All analytics charts (volume trend, grade distribution, market activity)
- Leader card stat panel
- Avg sale stat panel
- Highest sale stat panel
- Floor stat panel
- Population summary stat panel
- Transaction count stat panel
- Active cards stat panel
- Rank numbers and rarity from card rows
- Transaction count, last sale, TAG 10 pop from card rows
- Recent sales feed from card detail modal (keep structure but empty placeholder)
- Doppler section from card detail modal (keep structure but empty)

## Implementation Plan
1. Rewrite SetDetailPage.tsx keeping only: set header, 2 stat cards, cards list sorted by volume
2. Each card row: image, name, number, volume, active listings
3. Card detail modal: opens on tap, shows card identity only (population/sales/Doppler as future placeholders)
4. Style: soft mint pastel cards, white background, calm spacing, no charts
