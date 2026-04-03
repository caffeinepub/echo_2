# Minty — Mint Bubble Window

## Current State
The "Mint a Moment" button on LibraryPage opens `MintMomentModal`, which is a standard bottom-sheet slide-up panel (slides in from bottom, flat backdrop, no atmospheric effects).

## Requested Changes (Diff)

### Add
- Immersive glassmorphism bubble window centered on screen (replaces bottom sheet)
- Animated floating abstract particles/shapes behind the bubble at very low opacity
- Glow breathing keyframe animation on the bubble border
- Floating vertical drift animation on the bubble container
- Scale-in entry animation (0.96 → 1) + fade
- Atmospheric backdrop: darkened + blurred page, subtle floating abstract shapes

### Modify
- `MintMomentModal`: Replace bottom-sheet layout with a centered floating bubble window
  - 32px border radius
  - Translucent off-white glassmorphism surface (rgba ~255,255,255,0.72)
  - Backdrop-filter blur on the bubble itself
  - Soft mint ambient glow (box-shadow with mint color)
  - Light gradient lighting overlay inside the bubble
  - Smooth soft shadow
  - Backdrop now darkened + blurred (backdrop-filter on overlay)
  - Floating particles layer behind bubble
  - Payment pill buttons: rounded pill style, selected has soft mint glow outline
  - Same content structure and order preserved

### Remove
- Bottom-sheet slide-up animation (y: "100%" → 0)
- Drag handle pill at top
- Sheet-style border radius (24px top only)

## Implementation Plan
1. Rewrite `MintMomentModal.tsx`:
   - Centered modal layout (fixed, centered with flex)
   - Glassmorphism surface: translucent white, backdrop-filter blur, 32px radius
   - Mint ambient glow via box-shadow
   - Entry animation: scale 0.96→1 + opacity fade
   - Slow floating drift via CSS keyframe (translateY ±6px, 4s ease-in-out infinite)
   - Glow breathing via box-shadow keyframe
   - Particle layer: 6–8 soft abstract blobs at very low opacity, CSS animated
   - Backdrop: dark overlay + backdrop-filter blur
   - Scrollable interior content, max height 88vh
   - Payment pills: full pill shape, selected has `box-shadow: 0 0 0 2px mint + soft glow`
   - All existing content sections preserved in same order
