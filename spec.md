# Minty — Releases Tab Redesign

## Current State

- ReleasesPage.tsx (1325 lines): Market mode + Media mode (Photos/Videos). Market cards have cover image, title, caption, pack count, price, burn countdown, buy button. Ticker bar, filter tabs (Most Viewed/New/Minted).
- ReleaseFlowModal.tsx (855 lines): 3-step bottom-sheet. Steps: quantity, cover image picker + title/caption/price, confirm.
- ReleasesMarketContext.tsx: MarketRelease type with id, creatorName, coverImageUrl, title, caption, setName, packsAvailable, packIds, priceUsd, listedAt, expiresAt, status, collectibleType. No previewClipUrl.
- CollectionPage.tsx (1752 lines): Sealed packs with Release to Market button.

## Requested Changes (Diff)

### Add
- `previewClipUrl?: string` field to MarketRelease type
- Preview media option in ReleaseFlowModal: toggle between (A) upload 7-second preview clip or (B) select common image from set
- In ReleasesPage release cards: if previewClipUrl exists, render autoplaying muted looping video. On tap open expanded VideoPreviewModal (larger video, muted default, mute/unmute toggle, close button)
- VideoPreviewModal component inline in ReleasesPage
- Helper text: Unsold released packs burn after 24 hours

### Modify
- ReleaseFlowModal: Add media choice step — toggle Clip vs Image. Clip: file input for video, store as object URL. Pass previewClipUrl into MarketRelease on confirm
- ReleasesPage card media area: conditional video vs img based on previewClipUrl
- Release card layout: image/video-led, media fills top of card, content below
- Remove Market/Media segmented toggle and Media mode entirely
- Remove Most Viewed/New/Minted filter tabs, replace with section labels

### Remove
- Media mode (Photos/Videos) from ReleasesPage
- Filter tabs replaced by section headings

## Implementation Plan

1. ReleasesMarketContext.tsx: add previewClipUrl field, add one seed release with video URL
2. ReleaseFlowModal.tsx: add Clip/Image toggle in listing setup step; clip stores object URL; pass to MarketRelease
3. ReleasesPage.tsx: remove Media mode, remove filter tabs, add video card rendering with VideoPreviewModal, add helper text, keep ticker + section groupings
