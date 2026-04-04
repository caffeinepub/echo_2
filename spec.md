# Minty — Releases Marketplace Redesign

## Current State

### ReleasesPage
- Shows a marketplace of `SlabItem` listing cards (mock Pokémon/sports trading card graded slabs)
- Has a `TickerBar` with recent transactions, sort pills (Most Viewed | New | Minted), and a vertical list of `SlabCard` components
- Has a Market / Media segmented top toggle, with Photos (masonry) and Videos (swipe feed) sub-modes under Media
- Contains `BuyOfferModal`, `LiveOffersModal`, `SlabDetailSheet` modals
- Has zero connection to `CollectionContext` — entirely self-contained with static mock data

### CollectionContext
- `SealedPack` interface: `{ id, setName, editionNumber, totalSupply, collectibleType, pendingNFT, createdAt }`
- `CollectionNFT` interface: `{ id, title, setName, editionNumber, totalSupply, mediaType, imageUrl, rarity, mintDate, creator, owners, views, isLeader, addedAt }`
- `openPack(packId)` atomically removes sealed pack and adds its `pendingNFT` to `nfts`
- `addSealedPacks(packs[])` adds new sealed packs to the collection
- Persists to localStorage
- Seeds 2 mock sealed packs and 4 mock NFTs on first load

### CollectionPage
- Shows `SealedPackTile` grid (2-col) and `NFTTile` grid (2-col) in same tab
- `PackDetailSheet` has Open Pack button
- No "Release to Market" action exists yet

### App.tsx
- `View` type includes `"releases"` tab routing to `<ReleasesPage>`
- Provider stack: `ThemeProvider > IIProvider > WalletProvider > AdminReleasesProvider > MomentDraftProvider > CollectionProvider > AppContent`

## Requested Changes (Diff)

### Add

**New context: `ReleasesMarketContext`**
- Stores active release listings: `MarketRelease[]`
- `MarketRelease` interface:
  ```ts
  {
    id: string
    creatorName: string
    coverImageUrl: string   // chosen from set's pendingNFT images
    title: string
    caption: string
    setName: string
    packsAvailable: number  // count of packs in this listing
    packIds: string[]       // IDs of the specific SealedPack objects released
    priceUsd: number
    listedAt: number        // timestamp ms
    expiresAt: number       // listedAt + 24h in ms
    status: "active" | "burned" | "sold_out"
  }
  ```
- `addRelease(release: MarketRelease)` — adds a new listing, persists to localStorage
- `buyPack(releaseId, quantity)` — decrements `packsAvailable`, marks sold packs as transferred, adds new `SealedPack` to buyer's Collection
- `burnExpired()` — removes listings where `expiresAt < Date.now()` and `status === "active"` with remaining packs
- Persists to localStorage key `minty_releases`
- Seeds 2-3 mock release listings for demo purposes

**Release Flow Modal (`ReleaseFlowModal.tsx`)**
- Triggered from a "Release to Market" button on `SealedPackTile` in `CollectionPage`
- 3-step flow:
  1. **Quantity Step**: how many packs to send (stepper input + "Send all" button)
  2. **Listing Setup Step**: cover image picker (from set's images), title input, caption textarea, price input
  3. **Confirm Step**: summary card with all details, "Confirm Release" CTA
- On confirm: calls `addRelease()`, removes packs from `CollectionContext` (via new `removeSealedPacks(packIds[])` function)
- Design: glassmorphic modal, slide-up animation, off-white/mint palette, step indicator dots

**Updated `CollectionContext`**
- Add `removeSealedPacks(packIds: string[])` function to atomically remove N sealed packs by ID

**Updated `CollectionPage`**
- Add "Release to Market" button on each `SealedPackTile` (only if user has that pack type)
- Tapping "Release to Market" opens `ReleaseFlowModal` pre-scoped to that pack's `setName`

**Redesigned `ReleasesPage`**
- Remove the old `SlabItem` / `SlabCard` marketplace content (or preserve as fallback empty state)
- Remove Market/Media toggle — Releases is now solely the sealed pack marketplace
- New layout:
  ```
  <sticky header>
    TickerBar (keep existing, repurpose for pack sales)
    Section labels or filter pills: Live Releases | Ending Soon | Newly Released
    helper text: "Unsold released packs are burned after 24 hours."
  <feed>
    {activeReleases.map(r => <ReleaseCard />)}
  <empty state if no releases>
  ```
- `ReleaseCard` component:
  - Full-width or half-width card (mobile-first)
  - Large cover image at top (16:9 or 4:3 aspect)
  - Creator name (small, muted)
  - Release title (bold)
  - Caption (muted, 2 lines max)
  - Packs available pill + price per pack
  - Burn countdown timer (live, updates every second): `23h 14m left`
  - "Buy Pack" CTA button (mint gradient)
  - Soft mint border/glow, rounded corners, off-white card background
  - Tapping card opens `ReleaseDetailSheet`
- `ReleaseDetailSheet`:
  - Full cover image
  - All metadata (title, caption, creator, packs available, price, collectible type summary)
  - Prominent burn countdown
  - "Buy Pack" + optional "Make Offer" buttons
  - Buy triggers quantity picker → confirms → adds SealedPack to buyer Collection
- Sections logic:
  - "Ending Soon" = releases with `expiresAt - now < 4h`
  - "Newly Released" = releases with `listedAt > now - 2h`
  - "Live Releases" = everything else active
- Burn timer: run `setInterval` on mount, every minute call `burnExpired()` to clean up expired listings

### Modify

- `CollectionContext`: Add `removeSealedPacks(packIds: string[])` mutation
- `CollectionPage`: Add "Release to Market" action button on `SealedPackTile` cards, wire `ReleaseFlowModal`
- `App.tsx`: Wrap `AppContent` with `ReleasesMarketProvider` in provider stack

### Remove

- `MOCK_SLABS`, `SlabCard`, `SlabDetailSheet`, `BuyOfferModal` (old marketplace logic), `LiveOffersModal` from `ReleasesPage.tsx` — replace entirely with the sealed pack marketplace
- Market/Media toggle from Releases tab
- `sortMode: SortMode` state tied to the old sort pills

## Implementation Plan

1. Create `src/frontend/src/context/ReleasesMarketContext.tsx`
   - Define `MarketRelease` interface
   - State: `releases: MarketRelease[]`, persist to localStorage
   - Functions: `addRelease`, `buyPack`, `removePacks`, `burnExpired`
   - Seed 3 mock release listings with countdown timers already in progress

2. Update `src/frontend/src/context/CollectionContext.tsx`
   - Add `removeSealedPacks(packIds: string[])` to context interface and implementation

3. Create `src/frontend/src/components/ReleaseFlowModal.tsx`
   - 3-step modal: Quantity → Listing Setup (cover picker, title, caption, price) → Confirm
   - On confirm: calls `addRelease()` from `ReleasesMarketContext` + `removeSealedPacks()` from `CollectionContext`
   - Design: slide-up glassmorphic modal, step dots, off-white/mint palette

4. Update `src/frontend/src/pages/CollectionPage.tsx`
   - Add "Release to Market" button on each `SealedPackTile`
   - Import and render `ReleaseFlowModal` conditionally

5. Rewrite `src/frontend/src/pages/ReleasesPage.tsx`
   - Remove old SlabItem marketplace
   - New layout: TickerBar + section pills + `ReleaseCard` feed + empty state
   - `ReleaseCard` with cover image, title, caption, burn countdown, Buy button
   - `ReleaseDetailSheet` bottom sheet with buy flow
   - Burn timer interval on mount
   - Wire `buyPack()` to add SealedPack to CollectionContext

6. Update `src/frontend/src/App.tsx`
   - Add `ReleasesMarketProvider` to provider stack (wrap around AppContent)
