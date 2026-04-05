# Minty – Remove Cover Art Step from Mint a Moment Flow

## Current State
The Mint a Moment creation flow has 12 steps (0–11):
- Steps 0–8: capture 9 photos
- Step 9: record 1 video
- Step 10: capture a cover photo (separate from collectibles, used as pack art)
- Step 11: final setup (title, caption, hashtags, confirm mint)

`CaptureMomentPage.tsx` drives all 12 steps including cover photo capture UI, shutter, preview, and "Use as Cover" logic.

`MomentDraftContext.tsx` stores `coverPhoto: string | null` and `coverIndex: number` in the draft.

`App.tsx` reads `draft.coverPhoto` (and falls back to `draft.photos[draft.coverIndex]`) to set `coverImageUrl` on the release.

`MintMomentModal.tsx` mentions "Choose a cover image for the moment" in an instruction list.

## Requested Changes (Diff)

### Add
- Nothing new to add

### Modify
- **`CaptureMomentPage.tsx`**: Remove step 10 (cover photo capture) entirely. After the video is accepted (step 9), jump directly to step 11 (final setup). Remove: `pendingCoverPhotoUrl` state, `handleCoverShutterPress`, `handleUseCoverPhoto`, `handleRetakeCoverPhoto`, all step-10 UI blocks (viewfinder overlay, cover badge, cover art label, shutter button, cover photo preview), cover photo helper text under step indicator, step 10 from the dots array (reduce from 11 dots to 10). Update step type: `CaptureStep = 0|1|2|3|4|5|6|7|8|9|10` (step 10 = review). Update `getStepLabel()` to remove cover photo case. Update `progressPct` to use 10 total steps. Remove `setCoverPhoto` import from `useMomentDraft`.
- **`MomentDraftContext.tsx`**: Remove `coverPhoto` and `coverIndex` fields from the `MomentDraft` interface and state. Remove `setCoverPhoto` and `setCoverIndex` functions and their context exposure.
- **`App.tsx`**: Remove `coverImageUrl` derivation from `draft.coverPhoto`/`draft.coverIndex`. Instead, use the first photo as the release cover image, or a static fallback if no photos. Keep the rest of the release creation logic unchanged.
- **`MintMomentModal.tsx`**: Remove the "Choose a cover image for the moment" step from the instructional "How It Works" list. Update steps to: 1. Capture 9 photos, 2. Record 1 video, 3. Mint into sealed packs.

### Remove
- All cover photo capture UI in `CaptureMomentPage.tsx`
- `coverPhoto` and `coverIndex` from `MomentDraftContext`
- `setCoverPhoto`/`setCoverIndex` functions
- Cover art instructional text

## Implementation Plan
1. Edit `MomentDraftContext.tsx`: remove `coverPhoto`, `coverIndex`, `setCoverPhoto`, `setCoverIndex` from interface, initial state, reducer logic, and context value.
2. Edit `CaptureMomentPage.tsx`: collapse step 10 (cover photo) — after video accepted go to step 11 (now renumbered to 10), remove all cover-photo-specific state and handlers, remove all cover photo UI blocks, update step dots to 10, update progress to /10, update `getStepLabel`, remove `setCoverPhoto` usage.
3. Edit `App.tsx`: replace `draft.coverPhoto ?? draft.photos[draft.coverIndex]` with `draft.photos[0]` fallback for release cover image.
4. Edit `MintMomentModal.tsx`: remove cover image step from how-it-works list.
