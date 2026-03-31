# Minty — Featured Collectible Hero Display in Library

## Current State
LibraryPage (`src/frontend/src/pages/LibraryPage.tsx`) renders:
1. `<motion.h1>Library</motion.h1>` title at the top
2. Empty state if disconnected or no items
3. Content sections: "CLIPS" grid and "DROPS" (songs/collectibles) grid

There is no featured hero element between the title and the content sections.

## Requested Changes (Diff)

### Add
- `MintyHeroDisplay` component: a standalone inline component rendered in `LibraryPage` directly beneath the `<motion.h1>Library</motion.h1>` title and before the content sections (CLIPS/DROPS grids)
- The component displays `/images/minty_ice.png` (an ice crystal collectible image) centered horizontally
- CSS keyframe animation `mintyFloatRotate`: 3D Y-axis rotation (0→180→360 deg) combined with vertical float (-8px at 50%) over 18 seconds, ease-in-out infinite
- Slight mint teal drop-shadow / radial glow behind the image (no borders, no container box)
- The animation uses `perspective(900px)` and `transform-style: preserve-3d`
- Image max-height 240px on mobile, maintains aspect ratio, responsive

### Modify
- `LibraryPage`: insert the `MintyHeroDisplay` between the `<motion.h1>` and the empty-state/content sections
- Should appear regardless of connected/disconnected state (it's a decorative hero element for the Library screen)

### Remove
- Nothing removed

## Implementation Plan
1. Add the `@keyframes mintyFloatRotate` CSS into `index.css` (or as a `<style>` tag / inline via a style object using the given keyframes)
2. Create `MintyHeroDisplay` inline in `LibraryPage.tsx`:
   - Centered wrapper div: `flex justify-center`, `py-6 md:py-8`
   - `<img src="/images/minty_ice.png" ...>` with classes: `max-h-[240px] w-auto object-contain` + `.minty-hero` animation class
   - Soft radial mint glow behind it: a pseudo/sibling div with `bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,rgba(45,212,191,0.18),transparent)]` underneath the image
   - `transform-style: preserve-3d` on the image element
   - `prefers-reduced-motion` media query: disable animation for accessibility
3. Insert `<MintyHeroDisplay />` into `LibraryPage` render right after `<motion.h1>` and before the empty-state check
