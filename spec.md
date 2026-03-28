# ECHO — Light Mode Theme

## Current State
App is dark-mode only with a rich near-black background, soft panel borders, glowing text accents, and premium neon aesthetic. All colors are hardcoded as dark-mode values in CSS/Tailwind classes and inline styles.

## Requested Changes (Diff)

### Add
- Light mode CSS theme via `prefers-color-scheme: light` media query AND a manual toggle (sun/moon icon in header)
- CSS custom properties (variables) for all theme-sensitive values so both modes share the same structure
- Light mode token set: white/near-white backgrounds, near-black primary text, medium gray secondary text, cool gray borders, light elevated surfaces for cards and player
- Theme toggle button in header (small, minimal, sun/moon icon)

### Modify
- Refactor all background, text, border, and surface colors to use CSS variables instead of hardcoded dark values
- Reduce glow/bloom intensity by ~30% in light mode (purple glows become more subtle, not removed)
- Player surface: light elevated in light mode, dark icons, keep purple progress accent
- Keep all accent colors identical: purple, solana gradient, green/red percentages, cyan

### Remove
- Nothing removed — dark mode fully preserved as default

## Implementation Plan
1. Add CSS custom properties to `index.css` for dark (default) and light mode token sets
2. Implement a theme context/hook with localStorage persistence and system preference detection
3. Add a toggle button (sun/moon) to the header alongside the Phantom wallet button
4. Replace hardcoded color values throughout all components with CSS variables
5. Ensure glow filters/box-shadows use variable opacity so they reduce automatically in light mode
6. Test all three tabs (Library, Releases, Discover), player, modals, and leaderboard in both modes
