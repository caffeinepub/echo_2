# ECHO — Vine/TikTok NFT Clip Feed

## Current State
- ReleasesPage is an editorial lineup of music drops with artwork rows that expand on tap
- No in-app recording; admin uploads video files via ManageReleasesPage
- Songs have variable supply, variable price, variable mint windows
- Library shows owned tracks with edition badges
- MintModal handles Phantom wallet mint flow
- AudioPlayerContext drives global playback
- 15 mock SONGS in songs.ts with coverMotion video loops

## Requested Changes (Diff)

### Add
- `RecordClipPage`: in-app camera recording flow (front/back camera, 7s max, review, thumbnail picker, publish)
  - Camera toggle button (front/back)
  - Record button with 7s countdown progress ring
  - Post-recording review screen: plays clip back, lets user scrub to pick thumbnail frame
  - Publish button posts clip to feed
  - Caption/title input field before publish
- `ClipFeedPage`: replaces ReleasesPage with a full-screen vertical TikTok/Vine-style clip feed
  - Each card fills the viewport (full-width, ~85vh)
  - Video autoplays muted as card enters viewport
  - Overlay UI: creator name, caption, minted count (X / 50), time remaining in 7-day window, mint button
  - Swipe/scroll to next clip
  - Fixed "+" / record button in bottom-right corner of feed
- `Clip` data model (in clips.ts): id, creatorName, creatorWallet, caption, videoUrl, thumbnailUrl, postedAt (timestamp), mintWindowMs (7 days), mintedCount, supply=50, mintPrice=$5 USD, editionsByWallet map
- `useClipsData` hook: manages clips state, mint logic, edition assignment by mint order
- Mint flow on ClipFeedPage: taps "Mint for $5" opens existing MintModal adapted for clips
- Time remaining display: "Xd Yh left" countdown per clip
- After minting: owned clip appears in LibraryPage with thumbnail, caption, creator, edition number (1/50, 2/50...)
- Mock clip data: 6-8 clips using existing pexels video URLs from SONGS coverMotion, with realistic postedAt timestamps spread across the 7-day window

### Modify
- `ReleasesPage` → replaced by `ClipFeedPage` (ReleasesPage.tsx rewritten)
- `App.tsx`: wire "releases" tab to new ClipFeedPage; add "record" flow navigable from ClipFeedPage
- `LibraryPage`: show owned clips section (from clipsData) above or alongside owned songs; each owned clip card shows thumbnail, caption, creator, edition badge e.g. "7 / 50"
- `MintModal`: adapt to accept a clipId in addition to albumId so it works for clips; show clip thumbnail + $5 fixed price
- `songs.ts` Song type: no changes (existing songs remain in Discover/Library untouched)
- `BottomNav`: no changes needed — "releases" tab already routes to ReleasesPage

### Remove
- The editorial lineup layout from ReleasesPage (fully replaced by feed)
- Category filter tabs in ReleasesPage (replaced by simple feed)

## Implementation Plan
1. Create `src/frontend/src/data/clips.ts` with Clip interface and mock clip data (using pexels video URLs + generated thumbnail stills)
2. Create `src/frontend/src/hooks/useClipsData.ts` — manages clips array, mintClip(clipId, walletAddress) assigns next edition number, stores ownerships in localStorage
3. Rewrite `ReleasesPage.tsx` as `ClipFeedPage` — full-screen vertical scroll feed, each card fills viewport, video autoplay on scroll entry via IntersectionObserver, overlay with minted count, countdown timer, mint button
4. Create `RecordClipPage.tsx` — camera access via getUserMedia, front/back toggle, 7s MediaRecorder recording with countdown ring, playback review, canvas frame capture for thumbnail, caption input, publish button that calls useClipsData.addClip()
5. Update `App.tsx` to add `record-clip` view type and wire the + button from ClipFeedPage
6. Update `LibraryPage.tsx` to show owned clips section with edition badge
7. Update `MintModal.tsx` to handle clipId prop (either albumId or clipId must be provided)
