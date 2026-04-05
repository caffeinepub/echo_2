# Minty — Market Toggle in Releases Tab

## Current State

- `ReleasesPage.tsx` shows a single view of pack releases with filter tabs (Newest Moments, Hot Packs, Newly Released), a scrollable hashtag row, and release cards with bonding curve pricing.
- `CollectionPage.tsx` shows the user's sealed packs and opened NFT collectibles grouped by set. NFTDetailSheet has action buttons (Send to Wallet, Burn Collectible), but "Sell · Coming Soon" and "List for Sale · Coming Soon" are disabled stubs.
- `CollectionContext.tsx` holds `CollectionNFT` and `SealedPack` state.
- `ReleasesMarketContext.tsx` holds `MarketRelease` state for pack releases.
- No auction system exists yet.

## Requested Changes (Diff)

### Add
- `AuctionContext.tsx` — new context to store `AuctionListing[]` in localStorage, with methods to `createAuction`, `placeBid`, and compute auction state.
- `AuctionListing` type: `{ id, nftId, nftTitle, nftImageUrl, nftSetName, nftRarity, mediaType, creatorName, highestBid, bids: Bid[], endsAt, listingFee, status: 'active'|'ended' }`
- `Bid` type: `{ id, bidderName, amountUsd, placedAt }`
- Segmented toggle `Packs | Market` at the top of `ReleasesPage.tsx` (directly above where the ticker/tabs currently sit).
- `MarketView` component inside `ReleasesPage.tsx` — shown when Market is selected. Displays auction listing cards.
- Auction listing card displays: preview clip/image (2s loop), NFT title, current highest bid, number of bids, time remaining, Place Bid button.
- `SendToAuctionModal` component in `CollectionPage.tsx` — triggered from NFT detail sheet via a new "Send to Auction" button (replaces the disabled "Sell · Coming Soon" button).
  - Modal shows: title "Send to Auction", listing fee "Auction listing fee: $100", description text, slide-to-confirm slider.
  - On confirm: deducts $100 from wallet balance (mock), removes NFT from collection, creates auction listing in AuctionContext.
- `PlaceBidModal` component inside `ReleasesPage.tsx` — opens when user taps Place Bid on a Market card. Shows NFT info, current highest bid, input for bid amount, slide-to-confirm.
- Seed 2–3 mock auction listings in AuctionContext for demo purposes.

### Modify
- `ReleasesPage.tsx`: add segmented toggle state (`view: 'packs' | 'market'`). Wrap existing content in `view === 'packs'` condition. Add `view === 'market'` branch rendering `MarketView`.
- `CollectionPage.tsx` / `NFTDetailSheet`: replace the disabled "Sell · Coming Soon" button with an enabled "Send to Auction" button that opens `SendToAuctionModal`. Auction eligibility: only opened NFTs (not sealed packs), not already listed.

### Remove
- The disabled "Sell · Coming Soon" button stub in `NFTDetailSheet` (replaced by "Send to Auction").

## Implementation Plan

1. Create `src/frontend/src/context/AuctionContext.tsx` with `AuctionListing`, `Bid` types, localStorage persistence, `createAuction`, `placeBid`, `isListed` helpers, seed mock listings, and `AuctionProvider`/`useAuctions` hook.
2. Wire `AuctionProvider` into `App.tsx`.
3. Update `ReleasesPage.tsx`:
   - Import and use `useAuctions`.
   - Add `view` state toggle (`'packs' | 'market'`).
   - Render segmented toggle (`Packs | Market`) at top, styled consistently with existing filter pills.
   - Conditionally render existing content for `packs` view.
   - Render `MarketView` for `market` view — grid of `AuctionCard` components.
   - Add `AuctionCard` component: image/clip area (4/5 aspect), title, highest bid, bid count, countdown timer, Place Bid button.
   - Add `PlaceBidModal` with bid input, current bid info, slide-to-confirm.
4. Update `CollectionPage.tsx` `NFTDetailSheet`:
   - Replace disabled "Sell · Coming Soon" with "Send to Auction" button (enabled for opened NFTs not already listed).
   - Add `SendToAuctionModal` with fee display, description, slide-to-confirm. On confirm: call `createAuction`, mock-deduct $100, close sheet.
5. Auction business rules enforced in UI:
   - Only opened NFTs (from `nfts` array, not `sealedPacks`) can be listed.
   - NFT must not already be in an active auction (`isListed(nftId)`).
   - Auction duration = 24 hours from creation.
   - Highest bid wins (read-only display; no cancellation UI after first bid).
