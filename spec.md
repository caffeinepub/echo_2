# ECHO — Music to Video Collectibles Migration

## Current State

ECHO is a Solana-native NFT platform for collectible music drops. The data model is built around `Song` objects with `artist`, `artworkSrc`, `preview_url` (audio), `full_url` (audio), and `mintPrice` in SOL. The `AdminRelease` model has `audioFileName`, `audioDataUrl`, `audioExternalUrl`, `artist`. The `AudioPlayerContext` uses an `<audio>` element for playback. The `MintModal` shows a fixed SOL price from song data. The `ManageReleasesPage` has audio upload + artwork upload fields. All pages (Releases/Discover/Library) use music terminology (song, track, artist, plays, listeners). The player is a mini audio player bar. No categories, no tags, no per-wallet mint limits, no quantity selector, no video thumbnail frame picker.

## Requested Changes (Diff)

### Add
- `category` and `tags[]` fields to the content data model (`Song` interface and `AdminRelease`)
- `maxPerWallet` field to `AdminRelease` and `Song`
- Video thumbnail frame picker in admin upload flow: after video upload, user scrubs video timeline and captures a frame as the artwork/thumbnail using canvas
- Quantity selector in `MintModal`: allow minting 1–N copies (capped by `maxPerWallet` and remaining supply)
- Mint modal new wording: Price: $5 each, Quantity: 1/2/3, Remaining: X left, Max per wallet: N
- $5 USD default mint price — dynamically convert to SOL using live price from `useSolPrice`; show "$5.00" as headline, "≈ 0.0XXX SOL" underneath
- Category filter tabs on Discover page (Art, Animation, Fashion, Experimental, Meme, Short Film, Loop, Visual, Ambient, Performance)
- Category/tag filter on Releases page
- Category + tags display on all cards (Discover rows, Releases cards, Library items)
- Video element in `MiniPlayer` replacing `<audio>` element — same layout, but renders a small video thumbnail inline or uses poster frame
- `VideoPlayerContext` (rename/extend `AudioPlayerContext`) using `<video>` element instead of `<audio>`

### Modify
- `Song` interface: rename `artist` → `creator`, add `category: string`, `tags: string[]`, `maxPerWallet: number`, `videoDataUrl?: string`, `videoExternalUrl?: string`; keep `artworkSrc` (now = selected thumbnail frame)
- `AdminRelease` interface: rename `artist` → `creator`, `audioFileName` → `videoFileName`, `audioDataUrl` → `videoDataUrl`, `audioExternalUrl` → `videoExternalUrl`; add `category`, `tags`, `maxPerWallet`, `thumbnailDataUrl` (captured frame)
- `AudioPlayerContext` → `VideoPlayerContext`: replace `new Audio()` with `<video>` element ref; same API shape (play, pause, seek, queue, loop, preview)
- `MiniPlayer`: show video `<video>` element (small, muted for preview; sound for owned) instead of album art only; keep all animations, progress bar, controls
- `MintModal`: replace fixed SOL price with $5 USD→SOL conversion; add quantity selector; update copy (Price, Quantity, Remaining, Max per wallet)
- `ManageReleasesPage`: replace audio upload with video upload; add thumbnail frame selector (video scrub + canvas capture) that runs after video is uploaded; add category dropdown + tag input; add maxPerWallet field; default price = $5 in USD
- `useReleasesData` / `adminReleaseToSong`: map new video fields, category, tags, maxPerWallet, thumbnailDataUrl→artworkSrc
- `ReleasesPage`: update terminology (song→video, artist→creator, plays→views); show category/tags on cards; add category filter tabs
- `LibraryPage`: update terminology; show category badge on each owned video card
- `MarketPage` (Discover): update terminology; add category filter tabs; show category on leaderboard rows
- All mock data in `songs.ts` and `MarketPage.tsx`: add category, tags, maxPerWallet fields; update `artist` → `creator` terminology
- `SONGS` static data: add category + tags + maxPerWallet to all 3 entries
- All UI text: track→video, artist→creator, song→video, audio→video, plays→views, listeners→viewers, "play song"→"play video"

### Remove
- `audioFileName`, `audioDataUrl`, `audioExternalUrl` fields from `AdminRelease` (replaced by video equivalents)
- Music-specific language throughout all pages and components

## Implementation Plan

1. **Update data types** — `Song` interface in `songs.ts`: add `creator` (keep `artist` as alias for compat or replace), add `category`, `tags`, `maxPerWallet`, `videoDataUrl`, `videoExternalUrl`. Update all 3 mock songs.
2. **Update `AdminRelease`** — rename audio fields to video, add `thumbnailDataUrl`, `category`, `tags`, `maxPerWallet`.
3. **Rename `AudioPlayerContext` → `VideoPlayerContext`** — replace `new Audio()` with a managed `<video>` element (use a hidden `<video>` ref in the DOM via a portal or a rendered hidden element in the provider); keep entire API signature.
4. **Update `MiniPlayer`** — use video element for playback (or just control the shared video ref); show thumbnail/poster; keep all visual enhancements.
5. **Update `MintModal`** — price = $5 USD, show SOL equivalent; add quantity stepper (1 to min(maxPerWallet, remaining)); update copy.
6. **Update `ManageReleasesPage`** — replace audio upload with video upload; add frame capture tool (video + canvas + scrubber); add category select + tags input; add maxPerWallet field; default price = $5.
7. **Update `useReleasesData`** — map new fields.
8. **Update `ReleasesPage`** — terminology + category/tag display + category filter tabs.
9. **Update `LibraryPage`** — terminology + category badge.
10. **Update `MarketPage`** — terminology + category filter + category on rows.
11. **Global text sweep** — replace all music-specific labels with video equivalents.
