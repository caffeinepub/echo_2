# ECHO — Phase 1 Mint Flow

## Current State

- `useWallet` hook is a stub (no real Phantom integration, just local state)
- `useMockData` always returns all ALBUMS as both `ownedAlbums` and `allAlbums` — no real ownership
- ReleaseTile shows album info but no Buy button and no SOL mint price
- Album data (`albums.ts`) has no `mintPrice` field
- Library shows all albums as owned (no ownership gate)
- Streaming is fully unlocked for everyone — no preview-only restriction
- AlbumPlayerPage has no ownership check

## Requested Changes (Diff)

### Add
- `mintPrice: number` field to Album type and ALBUMS data (Fragments: 1.8 SOL, Charcoal: 2.0 SOL)
- `WalletContext` (React context) that wraps the existing `useWallet` stub but also stores owned album IDs (keyed by wallet address) in localStorage. Exposes: `isConnected`, `walletAddress`, `connect()`, `disconnect()`, `ownedAlbumIds: string[]`, `mintAlbum(albumId: string): Promise<void>`
- `mintAlbum()` simulates a Phantom transaction: show a confirmation modal → mock SOL deduction → assign next available edition number → persist owned album to localStorage → resolve
- Buy button on live ReleaseTile (only when `isSoldOut === false` and `mintOpensInMs === 0`). Shows SOL mint price with SolSymbol. Clicking opens MintModal.
- `MintModal` component: shows album artwork, title, edition count info, mint price in SOL, "Approve in Phantom" CTA. On confirm: calls `mintAlbum()`, shows loading state, then success state with assigned edition number (e.g. #090). Minimal dark modal, no clutter.
- `useMockData` updated to derive `ownedAlbums` from wallet context's `ownedAlbumIds` instead of returning all albums

### Modify
- `useWallet` — extend to accept wallet address (mock: use a static address like `"ph4nt0m...w4ll3t"`) and expose it. Connect should set a static mock address.
- `ReleaseTile` — add mint price display and Buy button for live releases
- `AlbumPlayerPage` — add ownership check. If album is NOT owned, show 30s preview mode: play button plays a 30s preview (use `playPreview`), show a subtle "Preview" label, show a "Buy to unlock full album" CTA that navigates to Releases. If owned, show full playback mode as today.
- `LibraryPage` — show empty state with prompt to browse Releases if no owned albums
- Album detail pages (MarketDetailPage) — no changes needed for Phase 1

### Remove
- Nothing removed

## Implementation Plan

1. Update `Album` type and ALBUMS data to add `mintPrice` field. Set Fragments to 1.8, Charcoal to 2.0. Also set `mintOpensInMs: 0` for Fragments so it shows as live.
2. Create `WalletContext.tsx` in `context/`: manages `isConnected`, `walletAddress`, `ownedAlbumIds` (localStorage), `mintAlbum(albumId)`. Wire into `App.tsx` as provider around everything. Update `useWallet` to read from this context.
3. Update `useMockData` to read `ownedAlbumIds` from WalletContext. `ownedAlbums` returns only ALBUMS whose IDs are in `ownedAlbumIds`.
4. Create `MintModal.tsx`: minimal dark modal. Shows artwork, title, price, edition count. States: idle → confirming ("Waiting for Phantom...") → success ("Edition #090 minted!"). On success, close after 2s delay.
5. Update `ReleaseTile` in `ReleasesPage.tsx`: show `⬡ {album.mintPrice}` using SolSymbol for live albums, add Buy button that opens MintModal (pass albumId). Prevent tile click from opening album detail when Buy is tapped.
6. Update `AlbumPlayerPage`: check if album is owned via WalletContext. If not owned: use `playPreview` mode, show "Preview" label on player, disable full track list interaction (show as locked with blur or muted), add sticky "Own this album · SOL 1.8" banner at bottom that triggers MintModal.
7. Update `LibraryPage`: empty state prompts to browse Releases.
