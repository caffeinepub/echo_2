# ECHO → Minty Visual Reskin

## Current State
ECHO is a premium collectible video platform with a dark purple/violet accent color system. The design tokens are defined in `index.css` using OKLCH, with `--accent` at hue 290 (violet), `--ring` at hue 290, glow utilities all using violet/purple, and reactive lighting in purple/cyan. The TopBar uses the Echo neon logo with purple-glow animation. BottomNav active states use violet. MiniPlayer uses violet gradient on seek bar and waveform. All interactive glows, borders, and highlights are purple-toned.

## Requested Changes (Diff)

### Add
- New Minty logo asset at `/assets/generated/minty-logo-transparent.dim_600x200.png` (already generated)
- Mint teal glow animation keyframes for logo (`minty-logo-glow`)
- New CSS custom properties for Minty palette: `--minty-accent`, `--minty-glow-*`

### Modify
- `index.css`: Replace all purple/violet color tokens with mint teal equivalents:
  - Background: near-black with subtle green tint (hue ~160-170, very low chroma)
  - Panels: dark grey-green surfaces
  - `--accent`: change from hue 290 (violet) to hue 160 (mint teal)
  - `--ring`: mint teal
  - All `--glow-violet-shadow` → mint glow equivalents
  - `--echo-bg`, `--echo-surface`, etc. → near-black with green tint
  - `--echo-text-secondary` → muted mint tone
  - `--echo-border` → thin mint tint
  - Echo reactive CSS classes (`echo-ra-glow`, `echo-ra-border`, `echo-ra-progress`) → mint teal colors instead of purple
  - Waveform bars gradient → mint teal
  - Light mode: preserve existing light mode logic but update accent to mint teal
- `TopBar.tsx`: 
  - Replace Echo logo PNG reference with Minty logo PNG
  - Update logo glow animation from purple to mint teal
  - Update Manage/Upload button colors from violet to mint teal
  - Update wallet button colors from purple to mint teal dark bg with mint border
- `BottomNav.tsx`: Change `VIOLET` and `VIOLET_GLOW` constants to mint teal equivalents
- `MiniPlayer.tsx`: 
  - Replace purple gradients on seek bar with mint teal
  - Update waveform bar gradient from `#7c3aed` → `#a78bfa` to mint teal
  - Replace `text-violet-400` (loop button) with mint teal
  - Update reactive glow ambient wash from violet to mint teal
  - Update particle colors from violet-tinted to mint-tinted

### Remove
- Purple/violet color references throughout CSS (replace, not just remove)

## Implementation Plan

1. Update `index.css` design tokens:
   - Background hue: ~165 (near-black green tint), e.g. `oklch(0.07 0.008 165)`
   - Surface: `oklch(0.10 0.008 165)`
   - Elevated/panel: `oklch(0.12 0.009 165)`
   - Accent: `oklch(0.70 0.18 165)` (mint teal)
   - Border: `oklch(0.18 0.012 165)` (thin mint tint)
   - Secondary text: `oklch(0.50 0.08 160)` (muted mint)
   - Ring: mint teal
   - Replace all violet glow shadows with mint teal equivalents
   - Update reactive CSS (echo-ra-*) to use mint teal rgb values
   - Glow intensities: base 8-14%, hover 16-22%, active 24-32% opacity

2. Update `TopBar.tsx`:
   - Logo src → `/assets/generated/minty-logo-transparent.dim_600x200.png`
   - Logo glow animation → mint teal drop-shadows
   - Button colors: violet oklch → mint oklch (hue 160-165)
   - Wallet button: purple bg → dark mint-tinted bg

3. Update `BottomNav.tsx`:
   - Replace VIOLET constant with mint: `oklch(0.65 0.18 160)`
   - Replace VIOLET_GLOW with mint glow

4. Update `MiniPlayer.tsx`:
   - Seek bar gradient: purple → mint teal
   - Waveform bars: purple gradient → mint gradient
   - Loop active: `text-violet-400` → inline mint color
   - Particle colors → mint-tinted (`#a8e6cf`, `#d4f5e9`)
   - Ambient wash: violet → mint teal
   - Glow keyframes: purple → mint teal

5. Validate and build
