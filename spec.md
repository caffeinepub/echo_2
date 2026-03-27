# ECHO — Phantom Wallet + NFT-Gated Playback

## Current State

The app has a fully simulated WalletContext using a hardcoded wallet address (`7KxM3nRabPqFdwW1P9m`) with simulated `connect()` and `mintAlbum()`. There is no real Phantom wallet adapter integration. Album and track data (`albums.ts`) have no `preview_url` or `full_url` fields per track — the AudioPlayerContext passes empty strings for `preview_url`. The ownership check is localStorage-keyed but uses the hardcoded address rather than a real wallet public key.

## Requested Changes (Diff)

### Add
- Real Phantom wallet connection via `window.solana` (Phantom browser extension API)
- `nft_mint_address` field to Album type (mock address string per album, for future on-chain matching)
- Per-track `preview_url` (30s clip) and `full_url` (full track) fields to Album Track type
- `circulatingSupply` state in WalletContext that decreases on successful mint
- TypeScript type declaration for `window.solana` (Phantom provider)

### Modify
- `WalletContext`: replace `connect()` simulation with real `window.solana.connect()` call; on connect, derive wallet address from public key; fall back gracefully if Phantom not installed (show toast or alert)
- `WalletContext.mintAlbum()`: keep simulated transaction structure but add a `window.solana.signTransaction()` call stub that catches rejection/cancellation; on success decrement the album's circulating supply (in component state)
- `Album` data type: add `nft_mint_address: string`, and update `Track` type to include `preview_url: string` and `full_url: string`
- `ALBUMS` data: populate `nft_mint_address` with mock Solana mint addresses, and add placeholder `preview_url` and `full_url` strings per track (empty strings fine — player degrades gracefully)
- `AudioPlayerContext.playPreview()`: pass `track.preview_url` to the audio element
- `AudioPlayerContext.playLibrary()`: pass `track.full_url` to the audio element instead of `preview_url`
- `AlbumPlayerPage.dispatchPlay()`: pass the track's `preview_url` or `full_url` based on ownership
- Supply display: use live circulating supply from WalletContext rather than static album data field after a mint

### Remove
- Hardcoded `WALLET_ADDRESS` constant in WalletContext
- `LS_CONNECTED` key assumption of a static address; key localStorage by real wallet public key

## Implementation Plan

1. Add `PhantomProvider` TypeScript interface to a `types/phantom.ts` file and extend `Window` interface
2. Update `Album` and `Track` types in `data/albums.ts`; populate mock `nft_mint_address`, `preview_url`, `full_url` on all tracks
3. Rewrite `WalletContext.tsx`:
   - `connect()`: calls `window.solana?.connect()`, reads `publicKey.toString()`, stores in state; if `window.solana` is undefined, shows `alert('Please install Phantom wallet')` 
   - `mintAlbum()`: simulates 1.5s delay, calls `window.solana?.signMessage()` as a stub (catches errors), then records ownership in localStorage keyed by real address and decrements circulatingSupply
   - Reconnect on mount if `window.solana?.isConnected` is true
4. Update `AudioPlayerContext.tsx`: `playLibrary()` uses `full_url` field passed in; `playPreview()` uses `preview_url`
5. Update `AlbumPlayerPage.tsx`: pass `track.preview_url` or `track.full_url` in `dispatchPlay()` based on ownership
6. Ensure supply stat row shows live circulating supply from WalletContext after mint
