# Minty – Frosted Glass Card Styling

## Current State
Listing cards in ReleasesPage.tsx use solid dark panel backgrounds (`oklch(0.12 0.03 160)`) with thin borders and no backdrop blur. The color constants `C.panel` and `C.panelHover` are solid opaque values. MarketPage uses CSS variables `--echo-surface` / `--echo-elevated` which are also solid opaque dark colors.

## Requested Changes (Diff)

### Add
- Frosted glass / translucent effect on SlabCard in ReleasesPage: semi-transparent dark teal background + `backdrop-filter: blur(12px)` (or `saturate(180%) blur(12px)` for depth)
- Subtle mint glow on card edges (box-shadow with low-opacity mint/teal)
- Layered illumination: a faint top-edge highlight (inset top border lighter than bottom)
- `--echo-surface-glass` CSS variable for frosted glass surface used across MarketPage album row cards too

### Modify
- `C.panel` → `oklch(0.18 0.06 160 / 0.40)` (semi-transparent dark teal)
- `C.panelHover` → `oklch(0.22 0.07 160 / 0.50)`
- `C.border` → `oklch(0.55 0.12 160 / 0.18)` (lighter, icy)
- `C.borderActive` → `oklch(0.65 0.16 160 / 0.40)`
- SlabCard `boxShadow` on hover → soft mint edge glow: `0 0 0 1px oklch(0.65 0.16 160 / 0.30), 0 4px 24px oklch(0.65 0.16 160 / 0.10)`
- SlabCard resting state also gets a very subtle box-shadow for the icy layered feel
- Thumbnail border updated to match icy border tone
- MarketPage album-row-card gets same frosted glass treatment via CSS variable update
- `--echo-surface` in dark mode CSS updated to translucent glass value
- `--echo-elevated` updated to slightly lighter glass value
- `--echo-border` updated to icy mint tint

### Remove
- Nothing removed — layout structure, typography, hierarchy, spacing all unchanged

## Implementation Plan
1. Update `C` color constants in ReleasesPage.tsx for frosted glass look
2. Add `backdropFilter: 'blur(12px) saturate(160%)'` to SlabCard outer `<button>` style
3. Update resting and hover `boxShadow` for subtle mint edge glow
4. Update thumbnail border color for icy aesthetic
5. Update detail sheet panel backgrounds similarly (same glass style)
6. In `index.css` dark mode, update `--echo-surface` and `--echo-elevated` to translucent values with backdrop-filter applied via `.album-row-card` class
7. Validate and build
