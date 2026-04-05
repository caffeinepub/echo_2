# Minty — Mint a Moment Refactor (Single Video)

## Current State

The Mint a Moment flow currently supports:
- 9 photo capture steps (steps 0–8) via `CaptureMomentPage.tsx`
- 1 video recording step (step 9, max 30s) via `CaptureMomentPage.tsx`
- A `FinalSetupScreen` step 10 with title/caption/hashtags/explicit fields showing "11/11" step counter
- `MomentDraft` interface holds: `photos: string[]` (up to 9), `video: string | null`, `captureMetadata`, `packSupply`
- `MomentDraftContext` exposes `addPhoto`, `removePhoto`, `addVideo`, `removeVideo` methods
- `MintMomentModal` explains: "Capture 9 photos", "Record 1 video", "Mint packs" with $10 mint cost and bonding curve
- `MintSetConfirmModal` shows: "9 photos → Common collectibles", "1 video → Rare collectible", $100 fee, bonding curve
- `FinalSetupScreen` summary shows "9 photos captured", "1 video captured", "100 packs will be minted"
- Backend `main.mo` has `Pack` and `Collectible` types but no `videoUrl`, `title`, `caption`, `hashtags`, or `explicit` fields on mint data
- No backend function for minting a moment — pack/collectible logic is separate

## Requested Changes (Diff)

### Add
- New single-step video recording experience in `CaptureMomentPage.tsx`:
  - Camera viewfinder with 4:5 portrait ratio
  - Record button: press to start, press to stop early
  - 7-second max countdown timer (visible, counting down from 7)
  - Auto-stop at 7 seconds
  - Preview the recorded video before continuing
  - Retake option on preview screen
  - Step counter shows "1/2" (record) → "2/2" (details)
- `MintMoment` Motoko type with fields: `id`, `creatorId`, `timestamp`, `title`, `caption`, `hashtags`, `explicit`, `videoChunks` (blob storage reference), `packSupply=300`
- Backend function `mintMoment` accepting `MintMomentInput`
- Backend function `getMintMoments` for retrieval

### Modify
- `MomentDraft` interface: remove `photos: string[]`, remove `captureMetadata`, keep `video`, `title`, `caption`, `hashtags`, `explicit`, `id`, `createdAt`, `completed`, `packSupply` (hardcode to 300)
- `MomentDraftContext`: remove `addPhoto`, `removePhoto` methods; keep all other methods
- `CaptureMomentPage.tsx`: replace 9-photo + 30s video flow with single 7s video flow
  - Step 0: camera viewfinder + record button + countdown timer
  - Step 1: video preview + retake or continue
  - Step 2: `FinalSetupScreen` for title/caption/hashtags/explicit
- `FinalSetupScreen.tsx`: remove "9 photos captured" / "1 video captured" from summary; show "1 video recorded" and "300 packs will be minted"; update step counter label
- `MintMomentModal.tsx`: update "How It Works" to: 1. Record a 7-second video, 2. Add title and details, 3. Mint into 300 packs; remove all bonding curve sections; keep $1 mint cost and fixed pricing explanation; update pack structure to reflect video-only collectible distribution
- `MintSetConfirmModal.tsx`: remove "9 photos → Common" / "1 video → Rare" checklist; replace with "1 video → 300 collectible packs"; update fee to $1; remove bonding curve references

### Remove
- All photo capture UI from `CaptureMomentPage.tsx` (steps 0–8, photo shutter, photo preview, pendingPhotoUrl logic, photo progress dots)
- `photos: string[]` field from `MomentDraft`
- `captureMetadata` array and `CaptureMetadataItem` type from `MomentDraft`
- `addPhoto`, `removePhoto` from `MomentDraftContext`
- `packSupply` setter from context (hardcode to 300)
- All references to "9 photos", "photo collectibles", "Common collectibles" in modal copy
- Any cover image logic remaining in flow
- Bonding curve copy/sections from `MintMomentModal` and `MintSetConfirmModal`

## Implementation Plan

1. **Backend (`main.mo`)**: Add `MintMoment` type and `mintMoment` / `getMintMoments` functions. Store: id, creatorId, timestamp, title, caption, hashtags, explicit, videoRef (text URL/blob ref), packSupply=300.
2. **`MomentDraftContext.tsx`**: Simplify draft interface — remove `photos`, `captureMetadata`. Keep `video`, `title`, `caption`, `hashtags`, `explicit`. Hardcode `packSupply=300`.
3. **`CaptureMomentPage.tsx`**: Full rewrite to 2-step flow: (a) video recording with 7s countdown + stop-early, (b) video preview with retake option. Then pass to `FinalSetupScreen`.
4. **`FinalSetupScreen.tsx`**: Update summary bullets to reflect single video. Update step label from "11/11" to "2/2".
5. **`MintMomentModal.tsx`**: Update How It Works steps to 3 items (record video, add details, mint). Remove bonding curve section. Update pack structure copy.
6. **`MintSetConfirmModal.tsx`**: Remove old photo/video breakdown checklist. Update to single video description. Update fee to $1. Remove bonding curve.
