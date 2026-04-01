# Minty - Wallet Button & Modal

## Current State
TopBar.tsx has an auth button that:
- Shows "Sign In" when not authenticated
- Shows "Signed In" with UserCircle2 icon when authenticated
- Clicking while signed in calls `clear()` to sign out

## Requested Changes (Diff)

### Add
- WalletModal component inside TopBar.tsx with:
  - Header: "Wallet" title + close button
  - Total balance summary section (mock USD total)
  - Asset list: USDC, BTC, ETH, Solana — each with icon, name, balance label, balance value
  - Per-asset action buttons: Receive, Send, Info
  - Sub-views: Info sheet (asset details), Receive sheet (address + QR placeholder), Send flow (amount input + confirm)
  - Theme-aware: light mode = white cards/soft gray dividers/mint accents; dark mode = crystal-glass panels/mint text/subtle glow borders

### Modify
- TopBar auth button:
  - Icon: UserCircle2 → Wallet (lucide `Wallet` icon)
  - Label: "Signed In" → "Wallet" (only when authenticated)
  - "Sign In" label unchanged when not authenticated
  - Clicking "Wallet" button when signed in opens WalletModal (no longer signs out directly)
  - Same button styling, size, placement, border radius, light/dark mode mint styling

### Remove
- `handleSignInClick` signing out on authenticated click — replace with opening WalletModal
- Keep sign-out accessible (e.g., a small sign-out option inside WalletModal or keep existing behavior via a button inside modal)

## Implementation Plan
1. Add `walletOpen` state to TopBar
2. Import `Wallet` icon from lucide-react
3. On authenticated button click: open walletOpen modal instead of calling `clear()`
4. Build WalletModal component within TopBar.tsx:
   - Mock balances for USDC, BTC, ETH, SOL
   - Per-asset row with icon, name, "Balance" label (small/secondary), value (prominent)
   - Three action buttons per asset: Receive, Send, Info (icon buttons, mint-tinted)
   - Sub-view states: `view: 'list' | 'receive' | 'send' | 'info'` + `activeAsset`
   - Receive view: wallet address placeholder + QR placeholder
   - Send view: amount input + recipient input + confirm button
   - Info view: asset name, description, price, 24h change
   - Bottom: sign out link
5. Theme-aware styling matching Minty crystal/white card language
