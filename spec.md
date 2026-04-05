# Minty — White Cycle Color Fix

## Current State
The White cycle (Cycle 7) exists and applies basic overrides via `[data-white-cycle]` in `index.css` and `CycleThemeContext.tsx`. However several issues remain:

1. **Warm-tinted backgrounds**: `#FAFAF8` (slightly warm off-white) is hardcoded in `LibraryPage.tsx` (lines 399, 1408), `ReleasesPage.tsx` (lines 305, 1210), `ReleaseFlowModal.tsx`, and `SetPackPriceModal.tsx`. These should be pure `#FFFFFF` or `#FCFCFC` in the white cycle.
2. **Global CSS nav/header overrides**: `nav.fixed.bottom-0` and `header.fixed` use `#d0dfef` border — a blue-tinted border. In white cycle these should be `#EAEAEA` (neutral gray).
3. **Button black override is too aggressive**: The `[data-white-cycle] button` rule forces ALL buttons black (including icon-only buttons and close buttons). Need to scope more carefully so secondary buttons remain white with black border.
4. **Tab bar**: Bottom nav needs explicit white background + black active icons in white cycle. Currently `--echo-nav-border` is set correctly, but the CSS `nav.fixed.bottom-0` rule uses hardcoded blue border `#d0dfef !important` that overrides the CSS var.
5. **Logo**: The white cycle logo (black badge + white lettering) looks correct — preserve as-is.
6. **`--echo-bg` default for white cycle**: Set to `#FFFFFF` not `#F7F7F5` or warm tones.
7. **Shadow**: White cycle shadows should be `0px 4px 12px rgba(0,0,0,0.05)` — no warm tones.
8. **Missing white cycle override for body/html background**: The `body` background comes from Tailwind's `bg-background` which resolves to the blue `--background` token. White cycle should override this to `#FFFFFF`.

## Requested Changes (Diff)

### Add
- White cycle override in `index.css` for `nav.fixed.bottom-0` that uses `--echo-nav-border` instead of hardcoded blue `#d0dfef`
- White cycle override for `header.fixed` to use `#EAEAEA` border
- White cycle override for `body` background to be `#FFFFFF`
- White cycle override for `.panel` shadow: `0 4px 12px rgba(0,0,0,0.05)`
- White cycle secondary button style: white bg, black border, black text (via `.white-secondary-btn` class or targeted overrides)

### Modify
- In `index.css` `[data-white-cycle]`: change `--echo-bg` from `#FFFFFF` to `#FFFFFF` (already correct), ensure `--echo-border` is `#1A1A1A` for thin black borders on key elements, or keep `#EAEAEA` for subtle dividers
- In `index.css` `[data-white-cycle] button` rule: add exception for buttons that should be secondary style (white bg, black border). The current rule makes ALL buttons black fill which is correct for primary CTA buttons. Keep it but ensure nav/icon buttons are properly handled.
- In `CycleThemeContext.tsx` white cycle `applyThemeVars`: ensure `--echo-border` is `#EAEAEA` (neutral, not blue) — already set correctly. Verify `--echo-bg` is `#FFFFFF`.
- Fix the `nav.fixed.bottom-0` CSS rule so it respects `[data-white-cycle]` and uses neutral `#EAEAEA` border instead of blue-tinted `#d0dfef`.
- Fix `header.fixed` CSS rule similarly.
- In `LibraryPage.tsx`: replace hardcoded `#FAFAF8` background with a variable-aware approach — use `var(--echo-bg, #FAFAF8)` so white cycle overrides it to white
- In `ReleasesPage.tsx`: same fix for `#FAFAF8`
- In `ReleaseFlowModal.tsx`: same fix
- In `SetPackPriceModal.tsx`: same fix
- In `BottomNav.tsx`: already has white cycle handling (`isWhite`), but nav background comes from CSS. Ensure the inline style uses `var(--echo-nav-bg)` which is set correctly for white cycle.

### Remove
- No removals needed — only color fixes

## Implementation Plan
1. **index.css**: Add `[data-white-cycle] nav.fixed.bottom-0` and `[data-white-cycle] header.fixed` overrides using `#EAEAEA` border. Add body background override. Adjust the white cycle button rule to be more surgical — primary CTAs get black fill, but add a secondary variant. Also fix the general `nav.fixed.bottom-0` rule to use `var(--echo-nav-border)` instead of hardcoded `#d0dfef`.
2. **LibraryPage.tsx, ReleasesPage.tsx, ReleaseFlowModal.tsx, SetPackPriceModal.tsx**: Replace `#FAFAF8` with `var(--echo-surface, #FCFCFC)` so white cycle shows pure white surfaces.
3. Validate, typecheck, build.
