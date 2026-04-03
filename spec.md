# Minty Pack Hero Card Enhancement

## Current State
The LibraryPage.tsx has a `PackCard` component — a plain white rounded card with:
- Top label "MINTY PACK"
- Divider line
- Small 80x80 SVG icon placeholder inside a gray rounded square
- Title "Minty Pack"
- Subtitle "Contains 1 collectible"
- Price "$1 per pack"
- Below the card: "Supply remaining: 50,000" and "Buy Pack" button

The card is entirely static, no animation, no imagery.

## Requested Changes (Diff)

### Add
- Background image (`/assets/2b94ee04-514b-458f-9635-3478ba602ea8-019d510a-36c0-7224-ac66-ae3f81d2f030.png`) filling the large card with cover sizing, frosted white overlay, and top-to-bottom white gradient for readability
- Product image (`/assets/comfyui_00009-019d510a-371e-750b-b780-72fcb79d8ba5.png`) inside the center product pedestal container
- CSS keyframe animations: floating Y-axis (4–8px), slow 3D Y rotation (−7° to 7°), slight X tilt (2–4°), slow glow pulse
- Rare slow light sweep animation across the pack surface (every ~12s)
- Entry animation: fade in + upward rise on mount, transitioning into idle float
- Hover/tap interaction: scale 1.02 + slightly intensified glow
- `prefers-reduced-motion` media query that disables rotation/float but preserves layout
- Soft ambient mint-white bloom glow behind the pack
- Subtle luminous edge on the product pedestal
- Soft drop shadow on the large card

### Modify
- `PackCard` component: replace SVG placeholder with image-based product pedestal + animated pack image
- Large card background: replace solid `#FAFAF8` with background image + overlays
- Product container: styled as soft glass pedestal (translucent off-white, inner highlight, mint-white border, shadow underneath)
- Text readability: add subtle text shadows where needed over the background image

### Remove
- SVG icon placeholder inside the pack container
- Solid flat card background (replaced by image + overlay)

## Implementation Plan
1. Add CSS keyframe animations to `index.css`: `packFloat`, `packRotate`, `glowPulse`, `lightSweep`
2. Rewrite `PackCard` in `LibraryPage.tsx`:
   - Large card outer div: background image + frosted white overlay + gradient overlay
   - Center product container: glass pedestal styling
   - Pack image: object-fit contain, 75% scale, bloom glow via box-shadow, animated with float + 3D rotate
   - Light sweep overlay pseudo-element or absolutely positioned div
   - Entry animation via motion/react initial/animate
   - Hover state managed with useState for intensified glow + scale
3. Respect `prefers-reduced-motion` via CSS media query on animation classes
4. All text preserved exactly, with `text-shadow` for readability over background image
