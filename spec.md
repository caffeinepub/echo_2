# Minty — Profile Button & Creator Dashboard

## Current State
- TopBar has an Upload button (pill style, mint outline) that opens UploadPage
- App.tsx view state includes `{ type: 'upload' }` which renders UploadPage
- TopBar accepts `onUploadClick` prop
- No Profile page or creator dashboard exists
- CollectionContext holds sealed packs and NFTs from minted sets
- Internet Identity provides the principal (wallet ID)

## Requested Changes (Diff)

### Add
- `ProfilePage.tsx` — full creator dashboard with:
  - Top section: shortened principal/wallet ID, join date, total sets created, total collectibles minted
  - Revenue Summary: Total Earned panel (3% creator royalty logic), breakdown by pack sales / NFT sales / resales
  - Sets Performance: per-set cards with title, cover preview, packs minted, sold, revenue, avg/best sale price; tap to expand deep analytics panel
  - Transaction Activity: recent royalty events list with thumbnail, type label, amount, date
- Profile button in TopBar replacing Upload button (same pill style: rounded, mint outline, mint icon, same padding/font)
  - Icon: `UserCircle` or `User` from lucide-react — minimal line style, mint accent
- `{ type: 'profile' }` view type in App.tsx
- Mock royalty/revenue data for UI (seeded inline in ProfilePage)

### Modify
- `TopBar.tsx`: remove Upload button and `onUploadClick` prop, add `onProfileClick` prop with Profile button
- `App.tsx`: remove `onUploadClick` and `{ type: 'upload' }` view handling, add `onProfileClick` and `{ type: 'profile' }` view rendering ProfilePage
- View type union: replace `{ type: 'upload' }` with `{ type: 'profile' }`

### Remove
- Upload button from TopBar
- `onUploadClick` prop from TopBar
- `{ type: 'upload' }` view from App.tsx (UploadPage import can remain but is no longer routed to from header)

## Implementation Plan
1. Create `ProfilePage.tsx` with mock data, 4 sections, set detail expand panel, transaction list
2. Update `TopBar.tsx`: replace Upload button with Profile button using `UserCircle` icon + same pill style variables
3. Update `App.tsx`: swap `onUploadClick`→`onProfileClick`, add `{ type: 'profile' }` view → `<ProfilePage onBack={...} />`
4. Royalty display logic: 3% creator, 1% Minty — read-only, no editing
5. Visual: off-white panels, mint accents, rounded containers, calm spacing — Minty design language
