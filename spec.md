# Minty — Cow Helper Character

## Current State
TopBar.tsx contains the Wallet button in the top-right header area. No cow character exists. The header uses PackStyleContext for theme colors.

## Requested Changes (Diff)

### Add
- `CowHelper` component: small animated cow image placed to the right of the Wallet button
- Idle animation: gentle side-to-side sway (CSS keyframe), loops continuously
- Periodic bounce every ~7s as a subtle interactive hint
- Click handler opens `CowInfoModal`
- `CowInfoModal`: floating popup matching Minty design language with Wallet Info content, theme-aware background, close button, tap-outside-to-close
- Generated cow image asset at `/assets/generated/minty-cow-helper-transparent.png`

### Modify
- `TopBar.tsx`: insert `<CowHelper />` directly after the Wallet/Auth button in the right-side flex container

### Remove
- Nothing

## Implementation Plan
1. Generate cow image asset
2. Add CSS keyframe animations (sway, bounce) in TopBar or index.css
3. Create `CowHelper` component inline in TopBar.tsx with image, animations, and click state
4. Create `CowInfoModal` component with Wallet Info text content, theme-aware colors from PackStyleContext
5. Render `<CowHelper />` after the auth button in the TopBar JSX
