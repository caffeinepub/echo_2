# Minty — Backend Media Storage for Mint a Moment

## Current State

The backend (`main.mo`) has legacy music/TCG types and pack/collectible types, but **no MintySet type** and no media storage. The frontend stores draft media as ephemeral blob URLs in localStorage, which do not survive page refresh or redeploy. The Mint a Moment capture flow has 9-photo + 1-video steps. The confirm modal and info modal both reference bonding curve pricing. `MomentDraftContext` has a `photos[]` array and defaults `packSupply` to 100.

## Requested Changes (Diff)

### Add
- `MintySet` Motoko type: `set_id`, `creator_principal_id`, `timestamp`, `title`, `caption`, `hashtags`, `explicit_flag`, `supply` (300), `price_per_pack_usd`
- `MediaAsset` Motoko type: `asset_id`, `set_id`, `media_type` (#image | #video | #preview_clip | #cover_image), `media_index`, `blob_storage_key`, `content_type`, `created_at`
- `NFTAsset` Motoko type: `nft_id`, `set_id`, `creator_principal_id`, `owner_principal_id`, `media_reference` (asset_id), `media_type`, `media_index`, `rarity` (#common | #rare), `edition_number`, `total_editions`, `auction_state`
- Backend functions: `createMintySet(input)`, `getMintySet(set_id)`, `getCreatorMintySets(creator_principal_id)`, `getPreviewMedia(set_id)`, `getFullMedia(asset_id)`
- Blob-storage component integration for persistent media (images + video files)
- Frontend: upload 9 images + 1 video (max 30s) to blob storage during mint flow
- Frontend: store blob storage keys in `MintySet` record on backend
- Frontend: wire `getSet`/`getCreatorSets`/`getPreviewMedia`/`getFullMedia` calls in Collection, Releases, and Library views
- Frontend: after video upload, generate a 2-second muted looping preview clip client-side using MediaRecorder/canvas trimming

### Modify
- `MomentDraftContext`: remove `photos[]`, keep `video`, add `images: File[]` (9 image files), add `coverImageIndex: number`, change `packSupply` default to 300
- `CaptureMomentPage`: update steps to 9-image upload/capture + 1-video, recording max 30s
- `FinalSetupScreen`: update summary text (9 images, 1 video, 300 packs), fix step counter, change submit button to "Confirm Mint"
- `MintSetConfirmModal`: remove bonding curve copy, change cost to $1, update pack content list to reflect new structure
- `MintMomentModal`: remove bonding curve section/function, update How It Works to 9 images + 1 video flow, update pack structure copy
- Mint flow: on slider confirm, upload all media to blob storage, call `createMintySet`, then navigate to Releases

### Remove
- All bonding curve pricing logic from `MintMomentModal` (`bondingCurvePrice`, `estimateRevenue` with quadratic formula)
- Bonding curve copy from `MintSetConfirmModal`
- `photos[]` array from `MomentDraftContext` and all capture steps that depend on it
- Stale pack economics grid from `MintSetConfirmModal` (Starting Price=$10, Max Price=$60, Bonding Curve label)

## Implementation Plan

1. Select `blob-storage` Caffeine component
2. Generate Motoko backend with `MintySet`, `MediaAsset`, `NFTAsset` types and all five data access functions; integrate with blob-storage for asset key storage
3. Frontend — update `MomentDraftContext` to hold 9 `File` objects (images) + 1 video blob + cover image index, remove `photos[]`
4. Frontend — update `CaptureMomentPage` to 9-image upload steps + 1-video record step (max 30s)
5. Frontend — on mint confirm, upload each media file to blob-storage, collect asset keys, call `createMintySet` with metadata + asset keys
6. Frontend — wire `getPreviewMedia` and `getFullMedia` to Collection grid, Releases cards, pack opening, and leaderboard
7. Frontend — remove all bonding curve copy from both modals; update `MintSetConfirmModal` cost to $1, pack content to 9 images + 1 video
8. Frontend — generate 2s preview clip client-side from video blob before upload
