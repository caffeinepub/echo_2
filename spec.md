# Minty — Anti-Spam, Viral Ranking, Top 25, Premium Leaderboard UI

## Current State

- Weekly Round system is live: 7-day rounds, $1 mints, NFTs posted to Releases feed
- CollectionPage shows a leaderboard sorted by `likes` only, shows top 10
- ReleasesPage is a vertical snap-scroll photo feed with filter bar
- ReleasesMarketContext manages releases and `likedIds` in localStorage
- Like logic: toggle like/unlike on any release, no duplicate prevention beyond `likedIds` set
- No anti-spam for minting or liking
- No viral scoring — rank is purely by total `like_count`
- LibraryPage countdown mentions "Top 10" rules
- finalizeRound keeps top 10, deletes the rest
- Backend (main.mo) has no weekly-round or anti-spam logic — all round state is frontend/localStorage

## Requested Changes (Diff)

### Add
- **Anti-spam for minting**: max 10 mints per 10 minutes per account, tracked in localStorage with timestamps. Show "Mint limit reached. Try again shortly." if exceeded.
- **Duplicate image hash check**: hash the uploaded image bytes (SHA-256 via SubtleCrypto). Store image hashes for current round. Reject mint if hash already exists.
- **Anti-spam for likes**: max 30 likes per minute per account, tracked in localStorage. If exceeded, disable like button for 60 seconds and show message.
- **One like per NFT per account**: already exists via `likedIds` set — enforce (no unlike for spam prevention purposes, keep the toggle for UX).
- **Account age check**: Store `account_created_timestamp` in localStorage on first app load. Prevent liking if account is less than 60 seconds old.
- **Viral score**: each release gets a computed `viral_score`. Store `likesLastHour`, `likesLast6Hours`, `likesLast24Hours` on each release (derived from a `likeTimestamps` array per release). Compute score: `(likes * 0.6) + (likesLast24h * 0.25) + (likesLast6h * 0.1) + (likesLastHour * 0.05)`
- **Leaderboard sorts by viral_score**: CollectionPage ranks by `viral_score` instead of raw `likes`
- **Rate limit state in context**: `mint_count_last_10_min`, `likes_last_60_sec`, `account_created_timestamp` stored and tracked

### Modify
- **Top 25 instead of Top 10**: `finalizeRound` keeps top 25 instead of 10. All UI text "Top 10" → "Top 25". Badge "Top 10 Weekly" → "Top 25 Weekly". Leaderboard shows 25 entries.
- **CollectionPage**: rebuild as premium leaderboard with 25 entries. Top 3 get larger cards with gold/silver/bronze glow. Others get compact cards. Rank badge has colored glow. Shows viral_score-based rank. Header: "Top 25 Weekly", sub: "Most liked moments this round".
- **ReleasesPage**: add "Leaderboard" toggle alongside the existing filter bar that switches to leaderboard view
- **ReleasesMarketContext**: add `likeTimestamps` map per release (array of timestamps), `likesLastHour`, `likesLast6Hours`, `likesLast24Hours` fields. Add `viral_score` computation. Add rate-limit state for likes.
- **LibraryPage**: update countdown text from "Top 10" to "Top 25". Wire mint anti-spam check.
- **WeeklyRoundContext / CaptureMomentPage**: wire duplicate hash check and mint rate limiting on confirm.

### Remove
- "Top 10" text everywhere replaced by "Top 25"
- Old leaderboard sort by raw `likes` replaced by `viral_score`

## Implementation Plan

1. **ReleasesMarketContext.tsx**
   - Add `likeTimestamps: Record<string, number[]>` to track per-NFT like times
   - Add computed helpers: `getLikesInWindow(id, ms)` → count likes in last N ms
   - Add `viralScore(release)` = `(likes*0.6) + (last24h*0.25) + (last6h*0.1) + (lastHour*0.05)`
   - Add rate-limit state: `accountCreatedAt`, `likeRateLimitUntil`, `mintTimestamps[]`
   - Expose: `isLikeRateLimited`, `likesRateLimitSecondsLeft`, `canMint`, `mintRateLimitMessage`, `checkAndRecordMint`, `checkImageHash`, `recordImageHash`
   - `finalizeRound`: keep top 25 (not top 10)

2. **CollectionPage.tsx** — complete rewrite of leaderboard UI
   - Header: "Top 25 Weekly", subtext: "Most liked moments this round"
   - Sort by viralScore
   - Top 3: large stacked cards with gold/silver/bronze glow border
   - Ranks 4–25: compact horizontal rows
   - Rank badge: gold (#C9A84C), silver (#A8A8A8), bronze (#CD7F32) glow
   - isTop25 badge instead of isTop10
   - White background, soft glow borders, Apple-like spacing

3. **ReleasesPage.tsx**
   - Add like rate-limit: if `isLikeRateLimited`, show like button disabled + countdown
   - Wire `likeRelease` to rate-limit check

4. **LibraryPage.tsx**
   - Change "Top 10" → "Top 25" in countdown banner
   - Wire mint anti-spam via `checkAndRecordMint()` before allowing capture

5. **CaptureMomentPage.tsx / MintSetConfirmModal**
   - On final confirm, compute SHA-256 hash of image bytes
   - Call `checkImageHash(hash, roundId)` — if duplicate, show error and block
   - Call `checkAndRecordMint()` — if rate limited, show message and block

6. **Text changes everywhere**: "Top 10" → "Top 25", badge "Top 25 Weekly"
