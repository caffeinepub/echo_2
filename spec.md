# Minty — Releases Page Market-Driven Enhancement

## Current State
- ReleasesPage.tsx: full Releases page with ReleaseCard component, BuyPacksModal, TickerBar, SlideToBuy, hashtag filters, and tab filters
- ReleasesMarketContext.tsx: bonding curve logic (`calcPackPrice`), release state with `packsAvailable`, `packCount`, `buyPack`, `buyPacks`
- Each card already shows: `packsAvailable`, `packsSold`, `currentPrice`, countdown, buy button
- ReleaseCard currently shows: `{packsSold} sold · {release.packsAvailable} remaining` as a plain text line
- No progress bar, no next-price indicator, no recent activity indicator, no price transition animation

## Requested Changes (Diff)

### Add
1. **Remaining supply display** — prominent "97 packs left" label near the price area, replacing or enhancing the existing plain text supply line
2. **Next price indicator** — small two-line label: current price + next pack price (price after 1 more pack sold via bonding curve)
3. **Progress bar** — thin (3-4px) minimal horizontal bar below the supply/price row; animated fill width as packs sell; uses accent color at ~40% opacity fill; smooth CSS transition on width
4. **Recent activity indicator** — "3 packs sold recently" line derived from `packsSold` relative to total; show only when packsSold > 0; uses a small dot or activity icon; subtle muted styling
5. **Subtle price animation** — when `currentPrice` changes (on re-render after purchase), price number uses CSS transition via `tabular-nums` + `transition: all 0.4s ease`; no bouncing

### Modify
- `ReleaseCard` component: replace the existing `Row 4b — sold / remaining` plain text section with the new enhanced market signal block described above
- Keep all existing rows (creator, title, caption, packs+price, countdown, buy button) in exact same order and position
- Supply/price row (Row 4): keep existing structure but add the next-price indicator next to or below current price

### Remove
- Nothing removed — only enhancements added inside the existing card layout

## Implementation Plan
1. Add `nextPackPrice` computation in `ReleaseCard` using `calcPackPrice(packsSold + 1, release.packCount)`
2. Replace the plain `Row 4b` text with a structured market signals block:
   - Supply row: bold "**{n} packs left**" in accent color (if < 50 remaining, show urgency; otherwise neutral muted)
   - Progress bar: thin div with width = `(packsSold / packCount * 100)%`, animated with CSS transition, accent color fill
   - Percent sold label: "32% sold" in muted small text next to progress bar
   - Next price line: small "Next: $10.12" in muted text beside the current price
   - Recent activity: "3 packs sold recently" with a soft pulsing dot, only shown if packsSold > 0
3. Add CSS `transition: color 0.4s ease` to the current price span so it animates on value change
4. Add `@keyframes progressFill` for initial bar fill on mount (0→actual width)
5. Keep all accent colors from existing `accentSolid`, `accentRgb`, `accentText`, `accentBorder` props already passed to `ReleaseCard`
6. Keep design: minimal, premium, calm — no extra borders, no heavy badges, no loud colors
