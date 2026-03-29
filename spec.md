# ECHO

## Current State
The Manage Releases page (`ManageReleasesPage.tsx`) opens the New Release / Edit Release form as a shadcn `Dialog` modal. On mobile, this Dialog renders over the fixed app header and bottom navigation, causing fields to be hidden or overlapping the UI chrome. The modal uses `max-h-[90vh]` but does not account for the fixed header height (~64–72px), bottom nav/player height (~80–100px), or iOS safe-area insets. The page header is sticky at `top: 72px`, but the Dialog is a portal overlay that ignores that offset.

## Requested Changes (Diff)

### Add
- A new inline `NewReleasePanel` component inside ManageReleasesPage that renders as a dedicated full-screen mobile page (not a Dialog portal)
- Proper top/bottom padding: top = app header height + safe-area-inset-top, bottom = nav/player height + safe-area-inset-bottom
- CSS env() safe area variables on the form container
- A sticky inner header for the form ("New Release" title + back/close button + optional save button) that sits at the top of this panel
- Scrollable form body below the sticky header
- `scroll-padding-top` or `scrollIntoView` so focused inputs scroll into view when keyboard opens

### Modify
- Replace the `<Dialog>` / `<DialogContent>` wrapper in `ReleaseFormModal` with the new full-screen panel approach
- When `modalOpen === true`, hide the Manage Releases toolbar/search bar/list so only the New Release panel is visible (no layered UI)
- The manage releases page sticky header `top` value already uses `72px` — keep that but also add it to the form panel top offset
- Remove `z-index` stacking conflicts so only one surface is active at a time

### Remove
- The `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` imports and wrappers from the form component (replace with plain div-based full-screen panel)
- `onOpenChange` / `handleOpen` dialog lifecycle that caused reset issues

## Implementation Plan
1. Convert `ReleaseFormModal` from a `Dialog`-based component to a `NewReleasePanel` full-screen component that is conditionally rendered in place (not a portal overlay)
2. The panel uses: `position: fixed; inset: 0; z-index: 50; overflow-y: auto; padding-top: calc(72px + env(safe-area-inset-top)); padding-bottom: calc(100px + env(safe-area-inset-bottom));`
3. Inside the panel: a sticky inner header (z-index 51) with back button, title, save button; then scrollable form body
4. In the main page return, when `modalOpen === true`, render ONLY the `NewReleasePanel` (skip the Manage Releases list/toolbar), else render the Manage Releases list as usual
5. Keep all form logic (validation, file handling, state) exactly as-is — only change the wrapper/layout
6. Remove Dialog import if no longer used
