# Minty — Camera-Only Capture Flow

## Current State

- `CaptureMomentPage.tsx` uses hidden `<input type="file">` elements for both photos and video, allowing users to upload from their device file system or camera roll.
- `ReleaseFlowModal.tsx` Step 1 has a "Preview Clip" mode that uses `<input type="file" accept="video/*">` for the 7-second preview clip upload.
- `useCamera.ts` already exists as a working hook with `startCamera`, `capturePhoto`, `switchCamera`, and `stopCamera`.
- `MomentDraftContext.tsx` stores `photos: string[]` and `video: string | null` — no authenticity metadata.

## Requested Changes (Diff)

### Add
- Live camera UI in `CaptureMomentPage`: full-screen camera viewfinder, guided step-by-step capture sequence (Photo 1 of 9 → Photo 9 of 9 → Video capture)
- Capture button (shutter) for photos
- Video recording with a 30-second max timer, start/stop button, and live countdown
- After each capture: preview + Retake / Keep UI before advancing to next step
- Step indicator label showing current step ("Photo 3 of 9", "Video")
- Front/back camera flip button
- Capture metadata on each media item: `capturedAt` timestamp, `sequenceIndex`
- In `MomentDraftContext`: add `captureMetadata` array with `{ sequenceIndex, capturedAt }` per media item
- In `ReleaseFlowModal`: replace file upload for preview clip with a camera recording UI (7-second max, record/stop button, preview + retake)

### Modify
- `CaptureMomentPage`: Replace all `<input type="file">` usage with live `useCamera` hook. Remove `photoInputRef`, `videoInputRef`, `handlePhotoChange`, `handleVideoChange`.
- `ReleaseFlowModal`: In "Preview Clip" mode, remove `<input type="file">` and replace with in-app camera recorder.
- `MomentDraftContext`: Add `captureMetadata: Array<{ sequenceIndex: number; capturedAt: number }>` to `MomentDraft` type.

### Remove
- All `<input type="file">` elements in `CaptureMomentPage`
- File upload for preview clip in `ReleaseFlowModal`
- Drag-and-drop or camera roll access anywhere in the capture flow

## Implementation Plan

1. Update `MomentDraftContext` type to include `captureMetadata`.
2. Rewrite `CaptureMomentPage` as a guided camera capture sequence:
   - State machine: step 0–8 = photos, step 9 = video, step 10 = review/print
   - Use `useCamera` for viewfinder; `capturePhoto()` for still capture
   - For video: use `MediaRecorder` on the camera stream, 30s max, live countdown
   - After each capture show a preview with Retake / Use Photo (or Retake / Use Video)
   - When all 10 captured, show summary grid and enable Print Moment
   - Record `capturedAt` timestamp per item, pass to `addPhoto`/`addVideo` with metadata
   - Flip camera button (front/back)
3. Rewrite `ReleaseFlowModal` "Preview Clip" section:
   - Show camera viewfinder inline in the sheet
   - Record button starts recording, max 7 seconds (auto-stops)
   - After recording: show preview with Retake / Use Clip options
   - No file input anywhere in this flow
4. Keep visual style: off-white, mint accents, rounded, premium minimal — do not redesign.
