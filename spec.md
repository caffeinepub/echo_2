# ECHO — Manage Releases Admin Page

## Current State
- App has three tabs: Library, Releases, Discover (market)
- Navigation is handled in App.tsx with a `Tab` type and `View` union
- WalletContext provides `walletAddress` and `isConnected`
- All releases are currently static mock data in `data/albums.ts`
- No admin interface exists; no upload or management workflow

## Requested Changes (Diff)

### Add
- `ManageReleasesPage` — full admin CMS page, only accessible to the configured admin wallet
- `AdminReleasesContext` — local state manager for admin-managed releases (localStorage-backed), with CRUD operations and status transitions
- Admin tab entry point: hidden from regular bottom nav; accessible via long-press or hidden gesture on Echo logo, OR by navigating to a dedicated tab type `"admin"` that doesn't appear in public nav
- Upload form with fields: track title, artist name, audio file, artwork file, price (SOL), supply/edition count, optional release date, optional description, optional genre/tag, rights status (Original/Licensed/Private test), visibility (Private/Scheduled/Public)
- Rights confirmation checkbox: "I confirm I have the rights or permission to upload this track." required before publishing
- Release status workflow: Draft → Scheduled → Live → Archived
- Per-release admin actions: Publish, Unpublish, Archive, Delete, Edit metadata
- Filter bar: All / Draft / Scheduled / Live / Archived
- Search input: by title and artist
- Access denied screen when non-admin wallet connects
- `ADMIN_WALLET_ADDRESS` constant at top of admin page for easy configuration

### Modify
- `App.tsx` — add `"admin"` to the `View` type; add navigation logic to show ManageReleasesPage; add a hidden admin access button in TopBar or as a discreet link
- `BottomNav.tsx` — admin tab NOT added to public nav; admin access must be discreet
- `TopBar.tsx` — add a small discreet "Manage" link or icon that only appears when admin wallet is connected

### Remove
- Nothing removed from existing public-facing pages

## Implementation Plan
1. Create `src/frontend/src/context/AdminReleasesContext.tsx` — stores releases in localStorage, provides CRUD, status transitions, filtering/search helpers
2. Create `src/frontend/src/pages/ManageReleasesPage.tsx` — full admin CMS UI:
   - Access control: check `walletAddress === ADMIN_WALLET_ADDRESS`; show "Access Denied" otherwise
   - Header with page title + "New Release" button
   - Filter pills (All/Draft/Scheduled/Live/Archived) + search input
   - Release table/list with per-row actions (Publish, Unpublish, Archive, Delete, Edit)
   - Upload/Edit modal with all required + optional fields, rights status, visibility selector, rights confirmation checkbox
3. Update `App.tsx` to include admin view type and render ManageReleasesPage
4. Update `TopBar.tsx` to show a discreet admin link (small icon/label, only visible to admin wallet)
5. Wrap app with AdminReleasesProvider
