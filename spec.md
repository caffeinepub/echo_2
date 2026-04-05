# Minty — Releases Tab Colorway Theming

## Current State
ReleasesPage.tsx uses hardcoded mint/green hex values (`#10b981`, `#059669`, `rgba(16,185,129,...)`) throughout its components: TickerBar, ReleaseCard hover shadows, Buy Pack button gradient, SlideToBuy track/fill/knob, BuyPacksModal qty pills, payment pills, success state, and TrendingHashtagsSection pills. The CycleThemeContext already provides `--cycle-accent`, `--cycle-accent-rgb`, and per-cycle RGB values (accentR/G/B) that the Library page already uses for its themed styling.

## Requested Changes (Diff)

### Add
- Import and consume `useCycleTheme()` in ReleasesPage.tsx
- Derive cycle-aware color variables (accent hex, glow rgba, tinted bg, border color, text accent) from activeCycle at the top of the ReleasesPage component and pass them down as props to all sub-components

### Modify
- **TickerBar**: replace hardcoded `#10b981`/`rgba(16,185,129,...)` colors with cycle accent colors
- **ReleaseCard**: hover box-shadow glow → cycle accent glow; Buy Pack button gradient → cycle accent gradient; Buy Pack button box-shadow → cycle accent glow; sold-out badge color uses cycle accent
- **SlideToBuy**: track background, fill gradient, border, label text, knob chevron color, complete state → all use cycle accent
- **BuyPacksModal**: modal border/shadow, qty pills (selected border/bg/text), payment pills (selected border/bg/text), success checkmark circle, success glow pulse, set name accent text, info box (bg/border/icon/text), close-to-collection pill → all use cycle accent
- **TrendingHashtagsSection**: pill background tint, pill border, hashtag text color → all use cycle accent
- **SectionHeader**: count badge background tint → subtle cycle accent tint
- **BuyPacksModal animation** `glowPulse` keyframes: replace hardcoded green rgba with cycle accent via CSS custom property

### Remove
- All hardcoded `#10b981`, `#059669`, `#047857`, `rgba(16,185,129,...)` references in ReleasesPage.tsx — replace with cycle-derived values

## Implementation Plan
1. Read `CycleThemeContext.tsx` to confirm the shape of `activeCycle` (accentR, accentG, accentB, accentOklchLight fields)
2. In `ReleasesPage.tsx`, add `useCycleTheme()` call and derive:
   - `accentHex` — computed from RGB as `rgb(R,G,B)` or inline style color
   - `accentRgb` — `"R,G,B"` string for rgba usage
   - `accentBg` — `rgba(R,G,B,0.09)` for tinted pill backgrounds
   - `accentBorder` — `rgba(R,G,B,0.28)` for pill outlines
   - `accentText` — `rgba(R,G,B,0.85)` or darkened shade for text on light bg
   - `accentGlow` — `rgba(R,G,B,0.25)` for shadows and glows
   - `accentStrong` — `rgb(R,G,B)` for buttons and active states
   - `accentGradient` — `linear-gradient(135deg, rgb(R,G,B) 0%, rgba(R*0.8,G*0.8,B*0.8) 100%)` for button fill
3. Pass these through to sub-components that are defined in the same file (TickerBar, SlideToBuy, TrendingHashtagsSection). For ReleaseCard and BuyPacksModal, also pass accent props.
4. Replace all green hardcodes with the derived variables
5. Validate and build
