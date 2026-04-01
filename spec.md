# Minty Catalog Manager

## Current State
- Admin page is `ManageReleasesPage.tsx` with music/release CMS language
- Backend has `TcgSet` type with CRUD but no Category or Card models
- Browse page (MarketPage) shows a flat list of sets filterable by TCG category
- Admin context (`AdminReleasesContext`) is music-release-oriented
- App.tsx references `ManageReleasesPage` and `AdminReleasesProvider`

## Requested Changes (Diff)

### Add
- `TcgCategory` type in backend: id, name, slug, imageUrl, isActive
- `TcgCard` type in backend: id, setId, cardName, cardNumber (optional), rarity (optional), imageUrl, isActive, isSupported
- Backend CRUD: createCategory, updateCategory, deleteCategory, toggleCategoryActive, getCategories, getAllCategoriesAdmin
- Backend CRUD: createCard, updateCard, deleteCard, toggleCardActive, toggleCardSupported, getCardsBySet, getAllCardsAdmin
- New `ManageCatalogPage.tsx` replacing `ManageReleasesPage.tsx` with three tabs: Categories, Sets, Cards
- Each tab: create form, list with edit/toggle/delete, image upload support
- Public browse flow: Categories grid → Sets in category → Cards in set (active only)

### Modify
- `App.tsx`: rename import/reference from `ManageReleasesPage` → `ManageCatalogPage`; rename `AdminReleasesProvider` → keep but deprecate (or remove if unused after catalog refactor)
- `MarketPage.tsx` (Discover/Browse Sets section): update to show Categories first; clicking a category shows its sets; clicking a set shows cards
- `TopBar.tsx`: admin button label stays consistent, no music language
- Backend `main.mo`: add Category and Card types and functions alongside existing TcgSet functions
- Seed backend with 4 categories: Pokemon, One Piece, Yu-Gi-Oh, Sports

### Remove
- `ManageReleasesPage.tsx` (replaced by `ManageCatalogPage.tsx`)
- Music/release language from admin UI ("Manage Releases" → "Manage Catalog")
- `AdminReleasesContext` usage from admin page (catalog manager uses backend directly)

## Implementation Plan
1. Update `main.mo` to add TcgCategory and TcgCard types with full CRUD
2. Create `ManageCatalogPage.tsx` with Categories/Sets/Cards tabs
3. Update `MarketPage.tsx` browse section to show category → set → card hierarchy
4. Update `App.tsx` to use `ManageCatalogPage` instead of `ManageReleasesPage`
5. Remove `ManageReleasesPage.tsx` and clean up dead `AdminReleasesContext` usage if possible
