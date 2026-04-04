# Minty — Mint Moment Collectible Generation Logic

## Current State

- `handleMintComplete` in `App.tsx` hardcodes `totalPacks = 10` (9 photos + 1 video)
- Only 10 collectibles are ever generated per set, regardless of pack supply
- Pool is built from exactly the 9 source photos + 1 video asset
- Rarity values on NFTs are arbitrary strings ("Rare", "Uncommon", etc.) not tied to photo/video type
- Collection tiles show a coloured rarity dot but no labelled badge (Common / Rare)
- The `InlineDescPanel` shows a generic rarity value without a visual rarity badge

## Requested Changes (Diff)

### Add
- Pack supply input field in `MintMomentModal` so creator sets how many packs to mint (e.g. 10–10000)
- `generateCollectibles(draft, totalPacks)` utility that:
  - Computes `photoCount = Math.round(totalPacks * 0.9)` and `videoCount = totalPacks - photoCount`
  - Assigns each pack a pre-determined collectible slot (photo or video) via shuffled pool
  - Photo collectibles numbered `#1…photoCount of photoCount`; each picks one of the 9 source photos cyclically
  - Video collectibles numbered `#1…videoCount of videoCount`; all use the same 30s video
  - Rarity: photo → `"Common"`, video → `"Rare"`
- Rarity badge on `VaultTile` (replaces rarity dot) showing `COMMON` or `RARE` text label, off-white pill style
- Rarity badge in `InlineDescPanel` header, matching Minty off-white styling
- Update `DETAILS` list in `MintMomentModal` to reflect dynamic pack supply

### Modify
- `handleMintComplete` in `App.tsx`: replace hardcoded `totalPacks = 10` with value from draft/modal; call new distribution logic
- `CollectionNFT.rarity` values from old arbitrary strings → `"Common"` | `"Rare"` for new mints (mock seeds can stay as-is for legacy)
- `VaultTile`: replace rarity dot with text badge pill; colour: grey for Common, mint for Rare
- `InlineDescPanel`: show rarity badge next to type badge; update `Print` label to show per-type numbering (e.g. Photo #23 of 90, Video #4 of 10)
- `MarketRelease.caption` updated to reflect actual pack count
- Mock seed NFT rarity values updated to `"Common"` or `"Rare"` where applicable

### Remove
- Hardcoded `const totalPacks = 10` in `handleMintComplete`
- Old rarity dot overlay on `VaultTile`

## Implementation Plan

1. Add `packSupply` field to `MomentDraft` context (default 100); add number input to `MintMomentModal`
2. Create `generateMintCollectibles(draft, totalPacks)` function in `App.tsx` (or a utils file)
3. Update `handleMintComplete` to use the draft's packSupply and call the generator
4. Replace rarity dot in `VaultTile` with a labelled badge pill (COMMON / RARE)
5. Update `InlineDescPanel` to show `Photo #X of N` vs `Video #X of M` per-type numbering and rarity badge
6. Update mock seed data to use `"Common"` / `"Rare"` rarity strings
