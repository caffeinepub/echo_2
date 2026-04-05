# Minty — White Cycle Refinement

## Current State

The app has a 7-cycle global theme system managed via `CycleThemeContext.tsx`. Cycle 4 is named "Off-white" and Cycle 7 is named "White". The existing White (Cycle 7) uses warm off-white backgrounds (#F7F7F5, #FAFAF8) with a black/gray accent system and a black badge logo with white lettering.

The `[data-white-cycle]` CSS block in `index.css` sets warm off-white surface tokens. The `CycleThemeContext.tsx` stores cycle names and labels. `TopBar.tsx` has explicit `isWhiteCycle` branching for logo and button styling.

## Requested Changes (Diff)

### Add
- New pure-white/near-white surface tokens for Cycle 7: `#FFFFFF`, `#FCFCFC`, `#F8F8F8`
- Hard black dividers/borders: `#EAEAEA` for dividers, `#000000` / `#1A1A1A` for primary borders
- White cycle button overrides: primary = black fill + white text (no gradient), secondary = white fill + thin black outline + black text
- Pill buttons: white fill + thin black border
- Active tab states: black icon + black text
- Inactive tab states: gray icon + gray text
- Card surfaces: pure white with very subtle shadow or thin outline
- Input fields: white fill + thin gray border + black text
- Icons: black or dark gray only (remove colored icon accents in white cycle)
- Sharp, high-contrast typography: primary text #000000, secondary #444444, tertiary #777777

### Modify
- **Cycle 4**: Rename from "Off-white" (`label: "Cycle 4 — Off-white"`) to "White" (`label: "Cycle 4 — White"`). Also update `name` from `"offwhite"` to `"white4"` to avoid naming conflict with Cycle 7.
- **Cycle 7**: Rename label from `"Cycle 7 — White"` to keep "White" but differentiate — since Cycle 4 becomes "White", Cycle 7 should be renamed to something distinct. Actually per user request: Cycle 4 (formerly Off-white) becomes "White". The existing Cycle 7 (currently called "White") should have its UI updated per the new spec. Rename Cycle 7 label to remain "White" since Cycle 4 is being renamed to take the "White" name — wait, re-reading: user says "Rename the Off-white theme to White" and "Update the White cycle" — this means: rename Cycle 4 to "White", and update Cycle 7 (which is already named White) with the new design. So Cycle 4 label becomes "Cycle 4 — White" and Cycle 7 keeps "Cycle 7 — White" but with updated design. Both will be named White but at different cycle numbers.
- **`[data-white-cycle]` CSS** (`index.css`): Replace warm off-white surface tokens with pure white/crisp tokens:
  - `--echo-bg: #FFFFFF` (was `#f7f7f5`)
  - `--echo-bg-alpha: rgba(255,255,255,0.98)` 
  - `--echo-surface: #FCFCFC` (was `#fafaf8`)
  - `--echo-surface-alt: #F8F8F8` (was `#f5f5f3`)
  - `--echo-elevated: #F0F0F0` (was `#efefed`)
  - `--echo-border: #EAEAEA` (was `#e8e8e6`)
  - `--echo-border-subtle: #F0F0F0`
  - `--echo-border-faint: #F5F5F5`
  - `--echo-text: #000000` (was `#111111`)
  - `--echo-text-dim: #111111`
  - `--echo-text-secondary: #444444`
  - `--echo-text-muted: #777777`
  - `--echo-nav-bg: rgba(255,255,255,0.98)`
  - `--echo-nav-border: #EAEAEA`
  - `--echo-header-bg: rgba(255,255,255,0.98)`
  - `--echo-header-border: #EAEAEA`
- **White cycle button overrides** (`index.css`): Update button styles — primary: black fill (#000000), white text, no warm tint. Secondary variant: white fill, thin black border. Remove any warm tint.
- **White cycle card styles**: Pure white surfaces, thin `#EAEAEA` or `#000000` borders, minimal box-shadow.
- **CycleThemeContext Cycle 7 surface vars**: Update `applyThemeVars` to use new pure-white tokens for Cycle 7.
- **TopBar.tsx**: Logo badge background changes from `#111111` to `#000000` for sharper black. Button styles in white cycle: pure black fill `#000000`, white text. Border on buttons: `1px solid #000000`.

### Remove
- Warm beige/cream tones from white cycle (no `#F7F7F5`, `#FAFAF8`, `#F5F5F3` warm variants)
- Any colored accents in white cycle (no colored icon tints, no RGB glow effects)
- Warm-tinted button backgrounds in white cycle

## Implementation Plan

1. **`CycleThemeContext.tsx`**: 
   - Cycle 4: change `name` to `"white4"`, `label` to `"Cycle 4 — White"`
   - Cycle 7: Update `applyThemeVars` white cycle block to use pure white tokens (#FFFFFF, #FCFCFC)
   - Update `--echo-bg`, `--echo-surface`, `--echo-header-bg`, `--echo-nav-bg`, and related border tokens to pure white/crisp values
   - Keep `--echo-text: #000000`, `--echo-text-secondary: #444444`, `--echo-text-muted: #777777`

2. **`index.css`**: 
   - Update `[data-white-cycle]` block: replace warm off-white hex values with pure white (#FFFFFF, #FCFCFC, #F8F8F8)
   - Update button overrides: `background: #000000`, `border-color: #000000`, hover: `#111111`
   - Update pill/filter styles: white fill (#FFFFFF), thin black border (#000000 at 20% opacity)
   - Add card surface override: white background, #EAEAEA border
   - Add input override: white fill, #EAEAEA border, #000000 text

3. **`TopBar.tsx`**: 
   - Logo badge: change background from `#111111` to `#000000` for crisp stamp look
   - Upload/Profile button in white cycle: `#000000` fill, white text, `1px solid #000000` border
   - Auth button in white cycle: `#000000` fill, white text
   - Remove any warm tint references
