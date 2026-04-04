# Minty — Moment Draft Blocking Flow

## Current State

- `LibraryPage` shows a pack card with a "Mint Moment" button that opens `MintMomentModal`.
- `MintMomentModal` has a slide-to-start control; completing it calls `onConfirm` which navigates to `CaptureMomentPage` via `App.tsx`.
- `CaptureMomentPage` is a static placeholder with 9 photo slots and 1 video slot, no state tracking.
- No draft state exists; users can re-open the mint modal and start a new Moment at any time.
- `App.tsx` manages navigation via a `View` union type.

## Requested Changes (Diff)

### Add
- `MomentDraftContext` (new file: `src/frontend/src/context/MomentDraftContext.tsx`)
  - Persists draft state in `localStorage` under key `minty_active_draft`
  - Shape: `{ id, photos: string[], video: string | null, completed: boolean, createdAt: number }`
  - Exposes: `activeDraft`, `startDraft()`, `addPhoto(url)`, `addVideo(url)`, `removePhoto(index)`, `removeVideo()`, `completeDraft()`, `clearDraft()`
  - `hasDraft`: boolean — true if activeDraft exists and `!completed`
- Progress display on `CaptureMomentPage`
  - Live `X/9 photos · X/1 video` counter
  - Photo slots become filled (show image preview) when photos are added
  - Video slot shows filled state when video is added
  - "Print Moment" / final action button disabled until 9 photos AND 1 video are present
  - On final button press: calls `completeDraft()`, then navigates back
- Locked state for `LibraryPage` Mint Moment button
  - When `hasDraft === true`: button text = "Finish Current Moment", tapping navigates to capture
  - Soft status message above button: "Your Moment is in progress."
  - Sub-message: "Complete capture and print to unlock your next Moment."
  - The `MintMomentModal` does NOT open in locked state
- Draft status banner on `CaptureMomentPage`
  - Small banner at top: "Moment In Progress — 3/9 photos · 0/1 video"

### Modify
- `App.tsx`: wrap `AppContent` in `MomentDraftProvider`; pass `onCaptureMoment` from draft context
- `LibraryPage`: consume `useMomentDraft` to check `hasDraft`; show locked/unlocked state for Mint button
- `CaptureMomentPage`: consume `useMomentDraft`; implement real photo/video slot interaction and progress
- `MintMomentModal`: `onConfirm` callback triggers `startDraft()` before navigation

### Remove
- Nothing removed; existing structure preserved

## Implementation Plan

1. Create `MomentDraftContext.tsx` with full draft state, localStorage sync, and exported hook `useMomentDraft`
2. Wrap `App.tsx` with `MomentDraftProvider`; pass `onCaptureMoment` that also calls `startDraft` if no active draft
3. Update `LibraryPage` to read `hasDraft`; render locked button state when draft is active
4. Update `MintMomentModal`: `onConfirm` now calls `startDraft()` through context before navigating
5. Rewrite `CaptureMomentPage` to show live photo/video grid with upload interactivity, progress counter, and a Print Moment button that only enables at 9+1; on press calls `completeDraft()` and navigates back
