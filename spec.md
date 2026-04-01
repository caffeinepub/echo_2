# Minty — Releases Card Redesign

## Current State
Releases listing cards are styled as market-stat cards showing: sparkline chart, volume label/value, percentage change, PSA/BGS/SGC grade badges, and a bottom row mixing price, % change, volume, and sparkline.

## Requested Changes (Diff)

### Add
- TAG grading system exclusively: TAG 10, TAG 9, TAG 8.5, etc.
- Listing-oriented bottom row: price (prominent, USD only) + TAG grade badge + pop count
- "Listed" or condition label replacing volume

### Modify
- GradeBadge: always shows TAG prefix, removes PSA/BGS/SGC
- SlabItem data model: grader field becomes TAG-only
- Mock data: all 15 slabs updated to use grader: "TAG"
- Card bottom row: remove sparkline, remove % change, remove volume — show price prominently with pop count
- Detail sheet: update grade distribution to TAG grades

### Remove
- Sparkline SVG component usage from cards
- Volume label/value from cards
- Percentage change display from cards
- PSA / BGS / Beckett grade references from cards
- Crypto price equivalents (already USD-only, confirm no SOL shown)

## Implementation Plan
1. Update `SlabItem` type: grader → `"TAG"`
2. Update all 15 mock items to use `grader: "TAG"`
3. Remove sparkline, priceChange display, and volume from `SlabCard`
4. Update `GradeBadge` to render `TAG {grade}` format
5. Update detail sheet grade distribution to TAG grades
6. Keep card size, spacing, rounded corners, image placement, and Minty dark/light styling unchanged
