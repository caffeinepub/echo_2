# Minty — Sealed Pack Lifecycle

## Current State

- `CollectionContext.tsx` manages `CollectionNFT[]` in localStorage. NFTs are added immediately when a Moment is minted (in `App.tsx` `handleMintComplete`).
- `CollectionPage.tsx` displays a 2-column NFT grid; tapping opens a detail sheet with metadata and a placeholder "List on Marketplace" button.
- `LibraryPage.tsx` has the flippable Minty Pack card with Mint Moment flow.
- `CaptureMomentPage.tsx` fires `onMintComplete(draft)` which calls `addNFTs()` directly in `App.tsx` — each photo/video becomes an NFT immediately.
- There is no concept of a "sealed pack" state; NFTs go straight into Collection as opened collectibles.
- Collection shows no separation between sealed packs and opened NFTs.

## Requested Changes (Diff)

### Add

- **`SealedPack` type** in `CollectionContext.tsx`:
  ```ts
  interface SealedPack {
    id: string;
    setName: string;
    editionNumber: number;   // e.g. 1
    totalSupply: number;     // e.g. 5
    collectibleType: 'photo' | 'video';
    // the NFT inside, revealed only after opening
    pendingNFT: CollectionNFT;
    createdAt: number;
  }
  ```
- **`sealedPacks`, `addSealedPacks`, `openPack`** to `CollectionContext` — `openPack(packId)` removes the sealed pack and inserts its `pendingNFT` into `nfts`.
- **`SealedPackTile`** component in `CollectionPage.tsx`: visually looks like an unopened Minty Pack. Shows:
  - Minty pack artwork (same green pack image used in LibraryPage)
  - Set name
  - Edition count (1 of N)
  - "SEALED" badge label
  - "1 collectible inside" indicator
- **Pack Detail screen** (inline sheet or full-screen overlay) shown when tapping a sealed pack:
  - Larger pack artwork
  - Set name, edition
  - "Open Pack" primary button
  - On press: plays a short scale/fade animation (~600ms), then reveals NFT, removes pack from list, adds NFT to collection
- **Send to Wallet modal** on opened NFT detail sheet:
  - Text input: "Enter wallet address"
  - Confirm transfer button
  - On confirm: NFT removed from sender collection (localStorage)
  - Shows a brief success state
- **"Sell" and "Send" action buttons** on NFT detail sheet (Sell = placeholder disabled "Coming Soon", Send = opens wallet modal)
- **"List for Sale" reserved space** (disabled button) on NFT detail — already exists as "List on Marketplace · Coming Soon", rename to "List for Sale · Coming Soon"
- **Section headers** in CollectionPage grid to visually group sealed packs (top) and opened NFTs (bottom), with a subtle separator label

### Modify

- **`App.tsx` `handleMintComplete`**: Instead of calling `addNFTs()` directly, generate sealed packs and call `addSealedPacks()`. Each photo/video in the draft becomes one `SealedPack` with a `pendingNFT` embedded.
- **`CollectionPage.tsx`**: Render sealed packs first (newest → oldest), then opened NFTs. Empty state only if both lists are empty.
- **NFT detail sheet**: Add Sell (disabled) and Send (opens modal) action buttons above the existing "List for Sale" button.

### Remove

- Direct `addNFTs()` call for minting in `App.tsx` (replaced by `addSealedPacks()`).

## Implementation Plan

1. **Extend `CollectionContext.tsx`**:
   - Add `SealedPack` interface and `pendingNFT: CollectionNFT` field.
   - Add `sealedPacks: SealedPack[]` state, persisted to localStorage key `minty_sealed_packs`.
   - Add `addSealedPacks(packs: SealedPack[])` and `openPack(packId: string)` — openPack removes from sealedPacks and appends pendingNFT to nfts.
   - Expose all via context.

2. **Update `App.tsx` `handleMintComplete`**:
   - For each photo and video in the draft, build a `SealedPack` with embedded `pendingNFT`.
   - Call `addSealedPacks()` instead of `addNFTs()`.

3. **Update `CollectionPage.tsx`**:
   - Import `sealedPacks` and `openPack` from context.
   - Add `SealedPackTile` component: Minty pack visual, set name, edition badge, SEALED label.
   - Add `PackDetailSheet` overlay: large pack image, set/edition info, Open Pack button, scale/fade animation on open, reveals NFT card view inside same sheet, then closes after 1.2s.
   - Section headers: "Sealed Packs" and "Collectibles" with mint-tinted text, only shown if both sections have items.
   - Add Send to Wallet modal + Sell/Send buttons on NFT detail sheet.
   - Rename "List on Marketplace · Coming Soon" → "List for Sale · Coming Soon".

4. **Seed data**: Update mock sealed packs (2–3 examples) so Collection shows content immediately on first load for UI testing. These mirror the existing mock NFTs pattern.
