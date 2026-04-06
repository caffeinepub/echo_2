# Minty — Weekly Round System

## Current State

Minty is a photo-first collectibles app with:
- **Library tab**: Shows a pack card + "Mint Moment" CTA. Mint flow captures 1 photo → title/caption/hashtags → confirmation modal → adds a `MarketRelease` to `ReleasesMarketContext`.
- **Releases tab**: Vertical snap-scroll photo feed sourced from `ReleasesMarketContext`. Supports Most Recent / Trending / Most Liked filters. Users can like posts.
- **Collections tab**: Weekly Leaderboard (Top 25 from last 7 days ranked by likes).
- **Pet tab**: Interactive cat mascot.
- **Data layer**: All data lives in `ReleasesMarketContext` (localStorage). `MarketRelease` is the core NFT-like object with `likes`, `listedAt`, `creatorName`, `coverImageUrl`, etc.
- **No backend NFT storage**: Images are object URLs, no persistent backend for NFT data.
- **No round concept**: There is no weekly round timer, round IDs, or round-end pruning logic.

## Requested Changes (Diff)

### Add
- `WeeklyRoundContext` — manages round state: `roundId`, `roundStartTs`, `roundEndTs`, active countdown, round transitions
- `WeeklyNft` type — extends `MarketRelease` with `roundId`, `isTop10`, `isDeletedAfterRound`
- Live countdown timer on Library tab: "Weekly Round ends in 6d 18h 22m 11s"
- Supporting copy on Library tab: "Mint unlimited photo NFTs this round / Each mint costs $1 in BTC / Only Top 10 most liked survive"
- Round badge on Releases feed items: small label "Round #N"
- Weekly Leaderboard (Top 10, not Top 25) on Collections tab
- "Top 10 Weekly" badge on surviving NFTs after round end
- Round-end logic: when `roundEndTs` is reached, top 10 survive, all others are marked deleted, new round starts immediately
- Mint flow updated: no packs, no pack price selector, slide to pay $1 BTC → NFT posted to Releases
- `MintMomentModal` updated: rewrite to reflect weekly round rules ($1 mint, image-only, Top 10 survive)
- `useWeeklyRound` hook for countdown
- 1-like-per-NFT-per-session enforcement (already partially there via `likedIds` set)

### Modify
- **Library tab**: Add countdown banner and round info strip above the Mint a Moment card
- **Releases tab**: Show round badge on each post; feed only shows NFTs from current round (not deleted ones)
- **Collections tab**: Change Top 25 to Top 10, label as "Weekly Leaderboard", add "Top 10 Weekly" badge on surviving items
- **`ReleasesMarketContext`**: Add `roundId` and `isTop10` and `isDeletedAfterRound` fields to `MarketRelease`; add `finalizeRound()` function that marks top 10 and deletes others; add `startNewRound()` function
- **`MintMomentModal`**: Rewrite content sections to reflect weekly round rules; remove bonding curve, earnings estimator, pack structure sections; replace with: "$1 per mint in BTC", "Image NFT only", "Top 10 survive"
- **App.tsx `handleMintSetConfirm`**: Simplify — no pack generation, just add a `WeeklyNft` release with `roundId` from context, `isTop10: false`, `isDeletedAfterRound: false`
- **Seed data**: Add `roundId: 1` to all seed releases; keep them as current-round items

### Remove
- Bonding curve pricing from `MintMomentModal`
- Earnings estimator from `MintMomentModal`
- Pack structure section from `MintMomentModal`
- Pack supply / price fields from mint confirmation
- "Supply remaining: 50,000" text from Library page

## Implementation Plan

1. **`WeeklyRoundContext.tsx`** — new context. Stores `roundId`, `roundStartTs`, `roundEndTs` in localStorage. Provides `timeRemaining` (object with days/hours/minutes/seconds), `currentRoundId`. On mount: if no round exists, initialize round 1 starting now (7 days). Auto-detects round expiry and calls `finalizeRound` on `ReleasesMarketContext` then starts a new round.

2. **`ReleasesMarketContext.tsx`** — add fields to `MarketRelease`: `roundId?: number`, `isTop10?: boolean`, `isDeletedAfterRound?: boolean`. Add `finalizeRound(roundId, endingRoundId)` function: ranks non-deleted releases by `likes`, marks top 10 as `isTop10: true`, marks rest as `isDeletedAfterRound: true`. Add `startNewRound()` (no-op on data, just triggers round context). Update `seedReleases` to include `roundId: 1`. Filter out `isDeletedAfterRound` releases from displayed feed.

3. **`LibraryPage.tsx`** — add countdown banner at top of page (above pack card). Shows "Weekly Round ends in Xd Xh Xm Xs" pulling from `WeeklyRoundContext`. Below timer: 3 lines of copy. Remove "Supply remaining" text.

4. **`MintMomentModal.tsx`** — rewrite middle sections. Keep: title, slide-to-mint, BTC-only payment display. Replace bonding curve / earnings / pack structure with: "$1 per mint", "Image NFT only — no packs, no video", "Only Top 10 most liked survive each round".

5. **`ReleasesPage.tsx`** — add round badge to each `PhotoFeedItem`. Filter out `isDeletedAfterRound: true` items. Show only items where `roundId === currentRoundId`.

6. **`CollectionPage.tsx`** — change Top 25 to Top 10. Add "Top 10 Weekly" gold badge on items where `isTop10: true`. Update header copy to "Weekly Leaderboard" / "Top 10 most liked this round".

7. **`App.tsx`** — wrap in `WeeklyRoundProvider`. Simplify `handleMintSetConfirm` to create a single NFT release (no packs), attach `roundId` from context.

8. **Backend `main.mo`** — add `WeeklyNft` and `WeeklyRound` types/storage for persistent round data and NFT records with `roundId`, `isTop10`, `likeCount`, `creatorPrincipalId`, `imageUrl`, `title`, `createdAt`, `isDeletedAfterRound`. Add `createWeeklyNft`, `getActiveRound`, `likeNft`, `finalizeRound`, `startNewRound` functions.
