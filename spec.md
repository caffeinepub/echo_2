# ECHO

## Current State
The app uses `EchoSolIcon.tsx` which loads a square PNG asset (`sol-icon-transparent.dim_128x128.png`) at 16px height. The existing PNG is square (1:1), which means when rendered at `height: 16px; width: auto`, it displays too narrow/small. Some placements may still have forced square containers.

## Requested Changes (Diff)

### Add
- Nothing new to add beyond updated asset path

### Modify
- `EchoSolIcon.tsx`: update `src` to use the new wide horizontal PNG `/assets/generated/sol-icon-echo.dim_96x32.png` (96x32, 3:1 aspect ratio). Ensure CSS is `height: 16px (or 18px for stat cards), width: auto, object-fit: contain, flex-shrink: 0, display: inline-block, vertical-align: middle, margin-right: 6px`. Add optional `size` prop that accepts `'default' | 'large'` or keep as number. Add subtle glow via `filter: drop-shadow(0 0 3px rgba(139,92,246,0.6)) drop-shadow(0 0 6px rgba(34,211,238,0.3))` on the img. Keep the 5s pulse animation.
- Remove any wrapping square container (`w-4 h-4`, `w-5 h-5` etc.) around `EchoSolIcon` usages in all pages/components.

### Remove
- Any `w-[n]px h-[n]px` or forced square wrapper divs/spans around the SOL icon

## Implementation Plan
1. Update `EchoSolIcon.tsx` to use new asset path, correct CSS, and add drop-shadow glow
2. Audit `MarketPage.tsx`, `MarketDetailPage.tsx`, `ReleasesPage.tsx`, `AlbumPlayerPage.tsx`, `MintModal.tsx` for any forced square containers around EchoSolIcon and remove them
3. Validate and build
