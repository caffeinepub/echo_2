# Minty

## Current State
The app has a TopBar component with an Admin Manage button that appears when the user is an admin (checked via `isAdminPrincipal`). The button calls `onAdminClick` which navigates to `{ type: 'admin' }` view, rendering `ManageCatalogPage`. The TopBar accepts `onAdminClick?` and `onProfileClick?` props. The `View` union type includes `{ type: 'admin' }`. The `ManageCatalogPage` and `ManageReleasesPage` files exist as pages.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `TopBar.tsx`: Remove the Admin Manage button block (lines ~1214-1248), remove `onAdminClick` from `TopBarProps` interface and destructuring, remove `Settings2` import if unused after removal, keep Profile and Wallet buttons and cycle color dot
- `App.tsx`: Remove `onAdminClick` prop from `<TopBar>`, remove `{ type: 'admin' }` from the `View` union type, remove the `{view.type === 'admin' && <ManageCatalogPage>}` render block, remove the `import { ManageCatalogPage }` import

### Remove
- Remove `onAdminClick` prop entirely from TopBar interface and usage
- Remove `{ type: 'admin' }` view type from App.tsx
- Remove ManageCatalogPage rendering from App.tsx
- Remove ManageCatalogPage import from App.tsx
- Do NOT delete the page files themselves (leave ManageCatalogPage.tsx and ManageReleasesPage.tsx in place — just don't import or route to them)

## Implementation Plan
1. Edit `TopBar.tsx`: delete the `{/* Admin Manage button */}` JSX block (~8 lines), remove `onAdminClick?` from `TopBarProps`, remove it from destructuring in the function signature, remove `Settings2` from the lucide import if it's no longer used elsewhere in the file
2. Edit `App.tsx`: remove `import { ManageCatalogPage }` line, remove `| { type: 'admin' }` from the View union type, remove `onAdminClick={() => setView({ type: 'admin' })}` from `<TopBar>`, remove the `{view.type === 'admin' && <ManageCatalogPage ...>}` render block
3. Validate — no TypeScript errors, no broken references
