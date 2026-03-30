# Minty — Logo & Releases Page Overhaul

## Current State
- TopBar uses a generated Minty logo PNG at `/assets/generated/minty-logo-transparent.dim_600x200.png`
- ReleasesPage is a TikTok/Vine-style vertical video feed with video players, play buttons, clip cards, REC button, and media playback controls
- Mint modal, sort filter, and scroll-snap feed are all video-centric

## Requested Changes (Diff)

### Add
- New Releases page: marketplace activity feed for graded card slabs / collectibles
- Each feed item is a clean card panel showing: card artwork (2D image), slab grade, set name, population data, market price, price change %, volume indicator, small sparkline chart, mint glow accent highlight, tap to open detail view
- Detail view (slide-up sheet or modal): larger artwork, price chart, population data, grade breakdown, recent sales, supply distribution, ownership verification status
- Mock data: newly verified slabs, trending slabs, high volume cards, notable sales, newly supported sets
- Logo: use uploaded Minty script PNG at `/assets/uploads/da0a37bf-f0f7-4b3e-8435-d339d757ced0-019d3c90-0de4-771f-8b28-c86522af61d6-1.png` as primary logo in TopBar with soft mint glow on dark bg

### Modify
- TopBar: swap logo src to the newly uploaded file path, keep same placement/sizing/glow animation
- ReleasesPage: fully replace video feed with collectibles activity feed; keep layout spacing system, bottom nav offsets, sort filter bar (Trending / New / Notable), no video/audio elements whatsoever
- Sort filter: rename options to match collectibles context (Trending / New / Notable)

### Remove
- All video `<video>` elements from ReleasesPage
- Play buttons, progress bars for media, REC button, media timelines, audio players
- ClipCard component and clip-based logic from ReleasesPage
- `useClipsContext` dependency from ReleasesPage (replace with local mock slab data)

## Implementation Plan
1. Update TopBar logo src to the uploaded file path
2. Create mock slab/collectible data (15 items) with: id, name, setName, grade, grader (PSA/BGS/SGC), population, marketPrice, priceChange, volume, sparklineData, imageUrl, verifiedAt
3. Rewrite ReleasesPage as a collectibles activity feed:
   - Keep fixed header with sort filter (Trending / New / Notable) and mint glow active state
   - Scrollable list of SlabCard panels below
   - Each SlabCard: card image thumbnail (square, ~72px), grade badge, set name, price, price change %, population, volume, sparkline
   - Tap card → open SlabDetailSheet (full modal with larger art, price chart, population breakdown, recent sales)
   - No video, no audio, no play buttons, no progress bars
   - Mint glow accent on card left border or active highlight
   - Near-black green-tinted background, thin illuminated borders, layered panel depth
4. Keep existing sort filter bar UI pattern but with collectibles-relevant labels
5. Validate and build
