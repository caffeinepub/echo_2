# Minty — Seller Listing Flow Overhaul

## Current State
- CreatorSubmitPage.tsx has a legacy upload form (SOL price, video/artwork upload, etc.) that does not reflect the slab-focused listing flow.
- ReleasesPage.tsx shows an ice/NFT eligibility icon on all `nftEligible: true` slabs unconditionally.
- NFT vault concept is surfaced at the listing card level before any purchase intent.

## Requested Changes (Diff)

### Add
- New multi-step seller listing flow (5 steps) inside CreatorSubmitPage (or a new SellerListingPage) replacing the old form:
  - **Step 1**: Select grader — TAG or PSA (two large option cards)
  - **Step 2**: Identify slab
    - TAG path: open camera QR code scanner, parse TAG slab QR
    - PSA path: text input for cert number
    - Auto-fetch and display locked metadata: card name, set, year, grade, cert ID, grader
    - Fields shown as read-only/locked after fetch
  - **Step 3**: Live camera photos only (front of slab, back of slab, label close-up)
    - Camera capture only — no file upload from gallery (`capture="environment"` + no accept fallback to gallery)
    - Preview thumbnails for each captured photo
  - **Step 4**: Set price
    - USD price input
    - Preferred payment toggle: USDC / ETH / BTC / SOL
  - **Step 5**: Review & publish listing
    - Summary of metadata, photos, price, payment rail
    - Publish button
- Step progress indicator (1–5) at the top

### Modify
- Remove the ice/NFT eligibility icon from listing cards in ReleasesPage — set `nftEligible` to never render the `IceNftIcon` on cards
- The `NftVaultModal` and `IceNftIcon` components remain in the codebase but are only triggered during buyer checkout (not shown on cards)
- No NFT/vault mention anywhere in the seller flow

### Remove
- Old CreatorSubmitPage form fields: SOL price, video upload, motion artwork upload, NFT-related checkboxes or mentions
- Ice icon display on listing cards (`nftEligible && <IceNftIcon />` block removed from card render)

## Implementation Plan
1. Rewrite CreatorSubmitPage.tsx as a 5-step wizard with the steps above.
2. Use `qr-code` camera component for TAG QR scanning in Step 2.
3. For Step 3, use `<input type="file" accept="image/*" capture="environment">` (forces camera on mobile, no gallery fallback note needed) — or use the `camera` caffeine component.
4. Simulate metadata fetch (mock) for both TAG QR and PSA cert number.
5. In ReleasesPage.tsx, remove the `{slab.nftEligible && <IceNftIcon ... />}` block from the card render so no ice icon appears on listings.
6. Keep NftVaultModal available for future wiring in buyer checkout flow.
