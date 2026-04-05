# Minty — Remove Supply Cycle, Add Pack Style Selector

## Current State
- `CycleThemeContext.tsx` manages a `CycleId` (1–4) mapped to Mint/Pink/Purple/Blue themes
- The context exports `useCycleTheme`, `CycleThemeProvider`, `CYCLE_THEMES`, `activeCycleId`, `setCycleId`
- `TopBar.tsx` renders a `CycleSelector` component with a dropdown labeled "Supply Cycle"
- Cycle items are labeled "Cycle 1 — Mint", "Cycle 2 — Pink", etc.
- All consumer pages (LibraryPage, ReleasesPage, CollectionPage, MarketPage, BottomNav, CollectibleCard, PackOpeningOverlay) import from `CycleThemeContext`
- CSS vars (`--cycle-accent`, `--cycle-accent-rgb`, etc.) drive UI accents app-wide
- `packWrapperUrl` in each theme drives the sealed pack wrapper image

## Requested Changes (Diff)

### Add
- New `PackStyleContext.tsx` replacing `CycleThemeContext.tsx` with renamed exports
- `PackStyleSelector` component in TopBar (4 selectable color dots/pills, labeled "Pack Style")
- localStorage key changes from `minty_active_cycle` to `minty_pack_style`

### Modify
- `CycleThemeContext.tsx` → `PackStyleContext.tsx`: rename `CycleId` → `PackStyleId`, `CycleTheme` → `PackStyle`, `CYCLE_THEMES` → `PACK_STYLES`, `activeCycleId` → `activeStyleId`, `activeCycle` → `activeStyle`, `setCycleId` → `setStyleId`, `CycleThemeProvider` → `PackStyleProvider`, `useCycleTheme` → `usePackStyle`
- Theme labels: "Cycle 1 — Mint" → "Mint", "Cycle 2 — Pink" → "Pink", etc.
- `TopBar.tsx`: replace `CycleSelector` dropdown with `PackStyleSelector` (4 color dots, no dropdown label, title shows "Pack Style")
- All consumer files: update imports from `CycleThemeContext` → `PackStyleContext`, rename `useCycleTheme` → `usePackStyle`, `activeCycle` → `activeStyle`
- `App.tsx`: replace `CycleThemeProvider` with `PackStyleProvider`
- BottomNav, LibraryPage, ReleasesPage, CollectionPage, MarketPage, CollectibleCard, PackOpeningOverlay: update import/usage

### Remove
- `CycleThemeContext.tsx` (replaced by `PackStyleContext.tsx`)
- All "cycle" wording in UI (labels, aria-labels, data-ocid strings)
- "Supply Cycle" dropdown label from TopBar
- Cycle numbering from theme labels

## Implementation Plan
1. Create `src/frontend/src/context/PackStyleContext.tsx` with renamed exports, same logic
2. Update `TopBar.tsx` — new `PackStyleSelector` with 4 color dots/pills, title "Pack Style"
3. Update all consumer files to use new context/hook names
4. Update `App.tsx` to use `PackStyleProvider`
5. Remove `CycleThemeContext.tsx`
