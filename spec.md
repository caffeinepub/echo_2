# Minty — Dynamic Browse Sets CMS

## Current State
The Browse Sets section in MarketPage.tsx uses a hardcoded `SETS` array (16 Pokemon sets). No backend storage, no admin management, no category filtering. All 16 sets are always shown with no way to add new ones without editing code.

## Requested Changes (Diff)

### Add
- Backend actor: `TcgSet` type with fields: id, tcgCategory, setName, setCode, releaseYear, coverImageUrl, slug, isActive, sortOrder, cardCount (opt), featured (opt). Stable storage for sets.
- Backend CRUD: `createSet`, `updateSet`, `deleteSet`, `getSets` (public, returns active only sorted), `getAllSetsAdmin` (admin only)
- Frontend: TCG category pill filter bar (All, Pokemon, One Piece, Yu-Gi-Oh, Sports) above Browse Sets grid, default selected = Pokemon
- Frontend: Dynamic set card rendering from backend data — cover image or code placeholder, set code label, set name
- Frontend: `/sets/:slug` dynamic route generated from set data (no hardcoded routes)
- Frontend: Admin "Manage Sets" tab in ManageReleasesPage — table of all sets with edit/toggle/delete actions
- Frontend: Add Set form with: tcgCategory dropdown, setName, setCode, releaseYear, coverImageUrl (URL input), isActive toggle, sortOrder, featured toggle
- Frontend: Edit Set inline or modal

### Modify
- MarketPage.tsx: Replace static `SETS` array with backend query; add category filter pills; filter/sort sets client-side
- ManageReleasesPage.tsx: Add a "Sets" management tab
- App.tsx: Add `/sets/:slug` route (dynamic, not hardcoded per-set)

### Remove
- Hardcoded `SETS` array in MarketPage.tsx

## Implementation Plan
1. Generate Motoko backend with TcgSet type and CRUD operations, admin-only writes, public reads
2. Seed backend with the existing 16 Pokemon sets as initial data
3. Update MarketPage to fetch sets from backend, show category filter pills, filter/sort dynamically
4. Add Set detail page at `/sets/:slug` (generic, data-driven)
5. Add "Sets" tab to ManageReleasesPage with add/edit/toggle/delete UI
