# Minty — White Cycle Theme (Cycle 7)

## Current State

The app has 6 supply cycle themes (Mint, Pink, Blue, Off-white, Purple, Gold), each stored in `CycleThemeContext.tsx` as a record keyed by `CycleId = 1 | 2 | 3 | 4 | 5 | 6`. Each cycle defines: `accentOklch`, `accentOklchDark`, `accentOklchLight`, `accentR/G/B`, `packWrapperUrl`, `glowDark/Light`, `logoFilter`. The `CycleSelector` in `TopBar.tsx` iterates `CYCLE_THEMES` to render the picker. `BottomNav` and `TopBar` have special-cased logic for Cycle 6 (Gold) to render white buttons with gold text/borders. CSS semantic tokens (`--echo-bg`, `--echo-surface`, etc.) are currently hardcoded to blue values in `index.css`.

## Requested Changes (Diff)

### Add
- **Cycle 7 — White** entry in `CYCLE_THEMES` with:
  - Accent: near-black (`#111111`, `oklch(0.14 0 0)`) — black is the accent for White cycle
  - RGB: 17, 17, 17
  - Pack wrapper: new white/off-white foil image `/assets/generated/pack-wrapper-cycle7-white-transparent.dim_400x560.png`
  - Logo: special treatment — black badge style with white lettering and subtle sparkle overlay (rendered in CSS/JSX, similar to gold shimmer approach)
  - `logoFilter`: custom black-badge CSS treatment (not a simple hue-rotate)
  - Glow: very subtle dark gray glow: `rgba(17,17,17,`
- **`CycleId` type** expanded to `1 | 2 | 3 | 4 | 5 | 6 | 7`
- **White cycle semantic surface tokens** injected by `applyThemeVars()` when Cycle 7 is active:
  - `--echo-bg`: `#F7F7F5` (primary off-white background)
  - `--echo-surface`: `#FAFAF8`
  - `--echo-surface-alt`: `#F5F5F3`
  - `--echo-elevated`: `#EFEFED`
  - `--echo-border`: `#E8E8E6`
  - `--echo-border-subtle`: `#EFEFED`
  - `--echo-border-faint`: `#F2F2F0`
  - `--echo-text`: `#111111`
  - `--echo-text-dim`: `#1A1A1A`
  - `--echo-text-secondary`: `#444444`
  - `--echo-text-muted`: `#777777`
  - `--echo-text-dark`: `#777777` (inactive tab color)
  - `--echo-nav-bg`: `rgba(247,247,245,0.98)`
  - `--echo-nav-border`: `#E8E8E6`
  - `--echo-header-bg`: `rgba(250,250,248,0.98)`
  - `--echo-header-border`: `#E8E8E6`
- **White cycle global CSS class** `[data-white-cycle]` scoped overrides for:
  - Primary buttons: black fill, white text, no glow
  - Secondary buttons: off-white fill, black outline, black text
  - Pill/hashtag chips: soft off-white fill, thin gray border, dark text
  - Cards: `#F7F7F5` fill, `#E8E8E6` border, soft 0 4px 12px rgba(0,0,0,0.06) shadow
  - Inputs: off-white fill, `#E8E8E6` border, `#111111` text
  - Active tab: `#111111` icon/text
  - Inactive tab: `#777777` icon/text
- **White logo treatment** in `TopBar.tsx`: `data-white-cycle` on root → CSS injects black badge wrapper behind the logo image with subtle sparkle CSS animation (similar to gold gleams approach, but extremely subtle — 2 tiny star points, very low opacity, long duration)
- **`injectNeonStyles`** in `TopBar.tsx` — add White cycle branch (Cycle 7): no breathe glow on logo; instead, minimal subtle sparkle flicker animation

### Modify
- **`CycleThemeContext.tsx`**:
  - Expand `CycleId` union to include `7`
  - Add Cycle 7 `CYCLE_THEMES[7]` entry
  - In `applyThemeVars()`: add White cycle branch (like Gold's special branch) that sets `data-white-cycle` attribute and injects white-specific semantic tokens onto `:root`
  - In `applyThemeVars()`: remove `data-white-cycle` when switching away
  - Update localStorage validation: `parsed >= 1 && parsed <= 7`
- **`TopBar.tsx`**:
  - Update `isGoldCycle` → keep as-is; add `isWhiteCycle = activeCycleId === 7`
  - White cycle logo: render with a thin black badge container behind the logo (not cropped; just a rounded pill/container that provides the dark background for the logo to show white lettering)
  - Since the original logo likely has mint-green lettering, White cycle needs `logoFilter` to invert to white: use `brightness(0) invert(1)` on the logo image to turn it white, inside a black-filled container
  - Profile and Wallet buttons in White cycle: black fill, white text/icon (like gold has gold text/borders)
  - Cycle dot indicator in White cycle: use black swatch color
  - `injectNeonStyles`: White cycle branch — simplified subtle sparkle at very low frequency
- **`BottomNav.tsx`**:
  - Add `isWhite = activeCycleId === 7` branch
  - Active tab color: `#111111` (near-black)
  - Active indicator: solid `#111111` line (no glow or minimal glow)
  - Inactive tab color: `#777777`
- **`index.css`**:
  - Add `[data-white-cycle]` block with full semantic token overrides (off-white surfaces, black text, gray borders)

### Remove
- Nothing removed — all existing cycles preserved

## Implementation Plan

1. Generate White cycle pack wrapper image (off-white/pearl foil)
2. Expand `CycleId` type to include `7` in `CycleThemeContext.tsx`
3. Add Cycle 7 config object to `CYCLE_THEMES`
4. In `applyThemeVars()`, add White cycle branch to inject all off-white semantic tokens and `data-white-cycle` attribute
5. Update localStorage parsing bounds to `<= 7`
6. Add `[data-white-cycle]` CSS block in `index.css` overriding surfaces, buttons, borders, text
7. In `TopBar.tsx`, handle White cycle logo: black badge container + inverted logo filter (`brightness(0) invert(1)`) + optional subtle sparkle CSS
8. Update Profile/Wallet button styles in `TopBar.tsx` for White cycle (black fill, white text)
9. Update `BottomNav.tsx` for White cycle active/inactive tab colors
10. Update `CycleSelector` dot rendering — White cycle dot should be near-black
11. Validate and build
