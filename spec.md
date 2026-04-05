# Minty — Blue Supply Cycle Theme + Light Mode Only

## Current State

- App supports both dark and light mode via `ThemeContext.tsx`. Default can be dark. A theme toggle button (Sun/Moon) appears in the TopBar.
- `CycleThemeContext.tsx` manages 6 supply cycle themes. Cycle 3 (Blue) exists but uses the default Minty mint green color system underneath because the light/dark token layer defaults to dark values.
- `index.css` has full dark-mode token set in `:root` and `.dark`, with a `[data-theme="light"]` override block.
- The blue accent for Cycle 3 is defined: `accentOklch: "0.78 0.10 240"`, with `accentR: 147, accentG: 197, accentB: 253`. These are the CSS var values injected by `applyThemeVars`.
- The existing `pack-wrapper-cycle3-blue-transparent.dim_400x560.png` (the original blue wrapper) is used for Cycle 3. A new improved version has been generated at `/assets/generated/pack-wrapper-cycle3-blue-v2-transparent.dim_400x560.png`.
- A new blue Minty logo has been generated at `/assets/generated/minty-logo-blue-transparent.dim_600x200.png`.
- TopBar renders a dark/light theme toggle button (Moon/Sun icon).
- `ThemeContext.tsx` defaults to dark or system preference.

## Requested Changes (Diff)

### Add
- Light-mode-only CSS token layer in `index.css` that applies permanently (no dark variant needed)
- Blue-specific semantic tokens: off-white background (#F7F9FC), white panels, soft blue borders, near-black text
- New blue logo path in TopBar when Cycle 3 is active

### Modify
- `ThemeContext.tsx`: force theme to always be `"light"`, remove toggle functionality, always set `data-theme="light"` on mount, clear dark class
- `index.css` `:root`: replace dark token defaults with light mode blue-accented values. Remove the `.dark` block entirely. Update `[data-theme="light"]` block to use blue-themed colors (off-white bg, white surfaces, blue borders)
- `CycleThemeContext.tsx` Cycle 3 blue theme: use the new improved blue pack wrapper `pack-wrapper-cycle3-blue-v2-transparent.dim_400x560.png`. Update the `accentOklchLight` value to a richer, more confident blue: `"0.58 0.18 240"` (was `0.60 0.12 240`). Update RGB values to match a deeper, cleaner blue: R=75, G=130, B=220
- `TopBar.tsx`: remove the theme toggle button (Moon/Sun) and its import. Remove `toggleTheme` usage. When `activeCycleId === 3`, use the blue logo `/assets/generated/minty-logo-blue-transparent.dim_600x200.png` instead of the default `/assets/minty-logo.png`. The CycleSelector dropdown panel should use white/light surface instead of dark glass background.
- All inline dark-mode conditional styles in TopBar (e.g. `isLight ? ... : ...` dark fallback branches) should default to the light path since there is no dark mode anymore.
- BottomNav: update `--echo-text-dark` usage to use light-mode appropriate muted color
- `index.css` light mode surface tokens: update `--echo-bg` to `#F7F9FC` (cool off-white with subtle blue tint), `--echo-surface` to `#FFFFFF`, `--echo-border` to `#D0DFEF` (soft blue-tinted border), `--echo-text-secondary` to `#5B7FA6`, `--echo-text-muted` to `#8BAEC8`
- `index.css` `.category-tab.active` border color: update hardcoded `rgba(52, 211, 153, 0.25)` references to use `rgba(var(--cycle-accent-rgb), 0.25)` (already done for the oklch color)
- Remove or neutralize all `.dark` CSS rules in `index.css`
- Remove `echo-ra-glow`, `echo-ra-border`, `echo-ra-progress`, `echo-ra-scale` dark-only rules (or make them light-safe by removing the `.dark` qualifier)

### Remove
- Dark theme toggle button from TopBar UI
- Dark mode CSS class application from `ThemeContext`
- `.dark { ... }` CSS block from `index.css`
- Dark-mode conditional branches in components (they can be simplified to always use the light path)

## Implementation Plan

1. **`ThemeContext.tsx`** — Hardcode `theme = "light"`, always add `data-theme="light"` to `<html>`, never add `.dark` class. Keep the `toggleTheme` function as a no-op to avoid breaking type consumers, but nothing calls it meaningfully.

2. **`index.css`** — 
   - In `:root`, change all dark surface tokens to light blue-themed values:
     - `--background: 0.978 0.002 240` (cool off-white)
     - `--foreground: 0.12 0.02 240` (near-black blue-tinted)
     - `--card: 1 0 0` (white)
     - `--border: 0.88 0.04 240` (soft blue border)
     - Keep cycle-accent vars at blue defaults: `oklch(0.58 0.18 240)`, RGB: 75,130,220
   - In `--echo-*` tokens under `:root`: set light values permanently:
     - `--echo-bg: #F7F9FC`
     - `--echo-surface: #FFFFFF`  
     - `--echo-border: #D0DFEF`
     - `--echo-text: #0D1520`
     - `--echo-text-secondary: #5B7FA6`
     - `--echo-nav-bg: rgba(255,255,255,0.98)`
     - `--echo-header-bg: rgba(255,255,255,0.98)`
   - Remove the `.dark { ... }` block entirely
   - Keep the `[data-theme="light"]` block but expand it to be the definitive token set
   - Update hardcoded `rgba(52, 211, 153, ...)` green references to use `rgba(var(--cycle-accent-rgb), ...)`

3. **`CycleThemeContext.tsx`** — Update Cycle 3:
   - `accentOklch: "0.58 0.18 240"`
   - `accentOklchDark: "0.62 0.18 240"` (not used but kept)
   - `accentOklchLight: "0.58 0.18 240"`
   - `accentR: 75, accentG: 130, accentB: 220`
   - `packWrapperUrl: "/assets/generated/pack-wrapper-cycle3-blue-v2-transparent.dim_400x560.png"`
   - `glowLight: "rgba(75,130,220,"`
   - `logoFilter: "none"` (blue logo is used directly, no filter needed)
   - Also set active cycle default to 3 (Blue) so the app starts in Blue cycle

4. **`TopBar.tsx`** —
   - Remove `Moon`, `Sun` imports from lucide-react
   - Remove `toggleTheme` usage and the theme toggle `<button>` from JSX
   - Remove `const { theme, toggleTheme } = useTheme()` (keep only `const isLight = true` since always light)
   - Update `MINTY_LOGO` logic: if `activeCycleId === 3`, use `/assets/generated/minty-logo-blue-transparent.dim_600x200.png`, otherwise keep `/assets/minty-logo.png`
   - Update CycleSelector dropdown: use white background `#FFFFFF` and blue-tinted border instead of dark glass
   - Since `isLight` is always `true`, remove all dark fallback branches from inline styles

5. **Polish** — All pages (Library, Releases, Discover, Collection) inherit from CSS vars, so they auto-update. The cycle accent being blue means all `var(--cycle-accent)` elements render blue. No page-level changes needed unless there are hardcoded dark color values.
