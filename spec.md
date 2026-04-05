# Minty – Remove Cursive/Script Fonts & Collection Header

## Current State
- `--font-brand` CSS variable in `index.css` is set to `"Dancing Script", cursive`
- `index.html` loads Google Fonts with `Dancing+Script:wght@600;700` alongside DM Sans
- Multiple components use `fontFamily: "var(--font-brand)"` inline style for decorative headings, modal titles, section labels, NFT titles, profile/wallet elements
- Files affected: `CollectionPage.tsx`, `LibraryPage.tsx`, `ReleasesPage.tsx`, `TopBar.tsx`, `MintSetConfirmModal.tsx`
- `CollectionPage.tsx` has a large "Collection" `<h1>` page header block (~lines 2522–2537) rendered above the asset grid

## Requested Changes (Diff)

### Add
- Nothing new to add

### Modify
- `index.css` line 8: change `--font-brand` from `"Dancing Script", cursive` to `"DM Sans", system-ui, sans-serif`
- `index.html`: remove `Dancing+Script:wght@600;700` from the Google Fonts URL (keep DM Sans)
- `CollectionPage.tsx`: anywhere `fontFamily: "var(--font-brand)"` appears, change to `fontFamily: "DM Sans, sans-serif"`. Also apply appropriate fontWeight for context (700 for titles, 500 for section labels, 400 for body)
- Same font-brand → DM Sans substitution in `LibraryPage.tsx`, `ReleasesPage.tsx`, `TopBar.tsx`, `MintSetConfirmModal.tsx`

### Remove
- The "Collection" page header `<div>` block in `CollectionPage.tsx` (the `<div style={{ marginBottom: "20px", paddingTop: "4px" }}>` containing the `<h1>Collection</h1>` element)
- Dancing Script from Google Fonts import

## Implementation Plan
1. Update `index.css`: change `--font-brand` to `"DM Sans", system-ui, sans-serif`
2. Update `index.html`: strip `Dancing+Script:wght@600;700&` from the Google Fonts link
3. In `CollectionPage.tsx`: replace all `fontFamily: "var(--font-brand)"` with `fontFamily: "DM Sans, sans-serif"` + remove the "Collection" page header block
4. In `LibraryPage.tsx`: replace all `fontFamily: "var(--font-brand)"` with `fontFamily: "DM Sans, sans-serif"` with appropriate weights
5. In `ReleasesPage.tsx`: same substitution
6. In `TopBar.tsx`: same substitution
7. In `MintSetConfirmModal.tsx`: same substitution
8. Validate and build
