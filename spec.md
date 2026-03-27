# ECHO — Minting Animation Flow

## Current State
The app has a `MintModal` component with states: `idle`, `connect`, `confirming`, `success`, `error`. The `confirming` state shows a simple spinner. The `mintAlbum` function in `WalletContext` simulates a 1.5s delay with no phased progress. The Releases page shows a small "Buy" button that becomes "Owned" text after purchase.

## Requested Changes (Diff)

### Add
- New mint UX states inside `MintModal`: `awaiting_approval`, `minting`, `confirmed`
- `awaiting_approval` state: Phantom ghost logo, breathing pulse ring animation, text "Waiting for Phantom approval..."
- `minting` state: album cover artwork centered large, animated SVG rotating progress ring around it, soft radial glow (purple/indigo low opacity), minimal particle dots orbiting, cycling status text "Minting your album..." / "Recording ownership on Solana..."
- `confirmed` state: animated SVG checkmark draw-in, text "Album minted successfully" / "Now in your wallet" / "Full album unlocked"
- Smooth AnimatePresence crossfade transitions between all states
- `WalletContext.mintAlbum` accepts optional `onApproved?: () => void` callback, called after 1s simulated approval, resolves after 2.5s total

### Modify
- `MintModal.tsx`: replace old `confirming` state with 3-phase flow (awaiting_approval → minting → confirmed)
- `WalletContext.mintAlbum`: add `onApproved` callback param
- `ReleasesPage.tsx` ReleaseTile: owned indicator changes to "Play Album" pill button

### Remove
- Old single-spinner `confirming` state in MintModal

## Implementation Plan
1. Update `WalletContext.mintAlbum` signature to accept `onApproved?: () => void`, call at 1s, resolve at 2.5s
2. Rewrite MintModal states with the 3-phase animation flow
3. Wire handleBuy: set awaiting_approval → onApproved sets minting → resolve sets confirmed
4. Update ReleaseTile owned CTA to "Play Album" pill
