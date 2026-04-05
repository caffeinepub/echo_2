# Minty — Global Cycle Theme System

## Current State
- `ThemeContext.tsx` manages only dark/light mode (no accent color control)
- All mint/accent colors are hardcoded inline as `oklch(0.68–0.76 0.18 160)` / `rgba(52,211,153,...)` across all pages and components
- `PACK_IMAGE` is a hardcoded constant pointing to a single green pack wrapper asset in `CollectionPage.tsx`, `PackOpeningOverlay.tsx`, and `LibraryPage.tsx`
- No supply cycle concept exists in the frontend
- `index.css` has fixed mint color tokens (`--accent`, `--ring`, `--mint`, glow vars, `minty-primary-btn`)

## Requested Changes (Diff)

### Add
- `CycleThemeContext.tsx` — centralized context with 6 cycle themes (Mint, Pink, Blue, Off-white, Purple, Gold), active cycle state (persisted to localStorage), and a `setCycle(n)` function. Each theme defines: `accentOklch`, `accentRgb`, `packWrapperUrl`, and display metadata.
- 6 pack wrapper images (one per cycle color) generated via the image generation tool
- CSS custom property injection: when active cycle changes, write `--cycle-accent`, `--cycle-accent-rgb`, `--cycle-glow`, `--cycle-border` onto `document.documentElement`
- `CycleThemeProvider` wraps the app in `App.tsx`
- `useCycleTheme()` hook for consuming the active theme anywhere
- Cycle selector UI in TopBar (or admin area) so the active cycle can be switched

### Modify
- `index.css` — replace hardcoded mint color values in `minty-primary-btn`, glow utilities, and CSS vars with `var(--cycle-accent-*)` references
- `TopBar.tsx` — logo glow and accent references use cycle CSS vars
- `CollectionPage.tsx` — `PACK_IMAGE` constant reads from active cycle theme instead of hardcoded path
- `PackOpeningOverlay.tsx` — `PACK_IMAGE` constant reads from active cycle theme
- `LibraryPage.tsx` — pack image path reads from active cycle theme
- All pages/components that inline `oklch(0.68–0.76 0.18 160)` or `rgba(52,211,153,...)` as accent/glow colors — replaced with `var(--cycle-accent)` / `var(--cycle-accent-rgb)`
- `BottomNav.tsx`, `ReleasesPage.tsx`, `MarketPage.tsx`, `DiscoverPage`, etc. — active tab, badge, pill accent colors use cycle vars

### Remove
- Hardcoded mint accent hex/oklch strings scattered across components (replaced by CSS variables)

## Implementation Plan
1. Generate 6 pack wrapper images (mint/pink/blue/off-white/purple/gold foil variants)
2. Create `src/frontend/src/context/CycleThemeContext.tsx` with theme config, state, and CSS injection
3. Wrap app with `CycleThemeProvider` in `App.tsx`
4. Update `index.css` — replace hardcoded mint in `minty-primary-btn` and glow utilities with cycle CSS vars
5. Update `TopBar.tsx` logo glow + accent references
6. Update `CollectionPage.tsx`, `PackOpeningOverlay.tsx`, `LibraryPage.tsx` to use cycle pack wrapper URL
7. Update `BottomNav.tsx` active tab color
8. Update `ReleasesPage.tsx`, `MarketPage.tsx`, `CollectionPage.tsx` inline accent styles
9. Add cycle selector control (accessible from TopBar or admin area)
10. Validate build
