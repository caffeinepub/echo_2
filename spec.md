# Minty — Gold Cycle Prestige Theme Fix

## Current State

- The Gold cycle (Cycle 6) exists in `CycleThemeContext.tsx` with accent RGB `212,175,55` and a CSS `logoFilter` of `hue-rotate(-75deg) saturate(1.4) brightness(1.12) contrast(1.05)` applied to the original mint logo
- The gold logo is just the mint logo hue-shifted — it looks flat and unconvincing
- Buttons across the app use a tinted accent background (`rgba(accentRgb, 0.07-0.12)`) with accent-colored text/border — the same pattern as all other cycles
- No special gold button treatment exists — gold buttons look the same as mint/blue/etc, just yellow-tinted
- The `injectNeonStyles()` function in TopBar injects shimmer/gleam keyframes for gold only
- The `applyThemeVars()` function in `CycleThemeContext` injects standard `--cycle-accent` CSS vars — no gold-specific overrides

## Requested Changes (Diff)

### Add
- New dedicated gold logo image asset: `minty-logo-gold-prestige-transparent.png` — metallic foil champagne-gold with specular highlights, embossed depth, gradient shading (not a hue-shifted mint logo)
- A `--gold-is-active` CSS custom property set to `1` (number) when Cycle 6 is active, `0` otherwise — enables CSS-only conditional styling
- Gold-specific CSS variables injected when Cycle 6 is active: `--gold-text`, `--gold-border`, `--gold-bg`, `--gold-glow`, `--gold-shimmer` with metallic gold values
- Global CSS rules in `index.css` for `.gold-cycle` class on `<html>` that override all button/pill/tab styling to: white background, metallic gold border, metallic gold text, soft gold glow
- Gold button glow keyframe animation (subtle pulsing gold bloom)

### Modify
- `CycleThemeContext.tsx` — Cycle 6 gold config: update accent RGB to champagne-gold `(212, 175, 55)`, update `applyThemeVars()` to also toggle `data-gold-cycle` attribute on `<html>` and add `gold-cycle` class when Cycle 6 is active
- `TopBar.tsx` — gold cycle logo: switch from hue-rotated mint logo to dedicated gold logo asset `minty-logo-gold-prestige-transparent.png`; enhance shimmer/gleam animation to be more refined
- `TopBar.tsx` — gold cycle header buttons (Manage, Profile, auth button): apply white bg + gold border + gold text + soft glow when `isGoldCycle === true`
- `BottomNav.tsx` — when gold cycle active, active tab indicator uses champagne gold color with soft gold glow
- `index.css` — add `[data-gold-cycle] button`, `[data-gold-cycle] .pill`, `[data-gold-cycle] .filter-pill` etc. selectors for global gold button override

### Remove
- The old `logoFilter` CSS approach for gold cycle in TopBar (replaced by dedicated logo asset)

## Implementation Plan

1. **CycleThemeContext** — When `activeCycleId === 6`, inject `data-gold-cycle="true"` on `document.documentElement` AND add CSS class `gold-cycle`. When any other cycle, remove both. Also set additional gold CSS vars: `--gold-metallic` for the metallic gradient, `--gold-border-color`, `--gold-text-color`, `--gold-glow-shadow`.

2. **TopBar logo** — When `isGoldCycle`, use `/assets/generated/minty-logo-gold-prestige-transparent.png` instead of the hue-filtered standard logo. Keep the shimmer sweep and star gleam overlays. Remove `logoFilter` application when gold cycle (the dedicated image handles the look).

3. **TopBar buttons** (Manage, Profile, auth) — When `isGoldCycle`, override button styles: `background: #FFFFFF`, `border: 1px solid rgba(212,175,55,0.75)`, `color: #B8860B` (rich gold text), `boxShadow: 0 0 12px rgba(212,175,55,0.25), 0 1px 3px rgba(0,0,0,0.06)`.

4. **Global CSS** — In `index.css`, add `[data-gold-cycle]` scoped rules:
   - All `button` elements and `.pill` chips: `background: #FFFFFF !important`, `border-color: rgba(212,175,55,0.70) !important`, `color: #9A7B1C !important`, `box-shadow: 0 0 10px rgba(212,175,55,0.20) !important`
   - Active/selected states: gold text + slightly stronger gold glow
   - Tab active indicators: gold color
   - Filter pills selected: white bg + gold border + gold text
   - `.echo-logo-neon` when gold: use rich gold drop-shadow colors

5. **BottomNav** — When gold cycle, active color = `#C9A227` (warm champagne gold), glow = `rgba(212,175,55,0.40)`.

6. All pages (ReleasesPage, LibraryPage, DiscoverPage, CollectionPage) already use `var(--cycle-accent)` and `rgba(var(--cycle-accent-rgb), ...)` — the `[data-gold-cycle]` CSS overrides will cascade to these automatically for the button/pill/outlined-control elements. Inline style overrides in page components need to be handled via the context-injected CSS vars.
