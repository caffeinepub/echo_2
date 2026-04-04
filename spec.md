# Minty — Content Labeling & Visibility Controls

## Current State

- `CaptureMomentPage` captures 9 photos + 1 video and after capture goes to a basic "Review & Print" screen (step 10) that only shows the photo grid, video slot, and a "Print Moment" button.
- `SetPackPriceModal` intercepts after capture to ask for pack price, then builds a `MarketRelease` and calls `addRelease()`.
- `MomentDraft` stores: `id`, `photos[]`, `video`, `completed`, `createdAt`, `captureMetadata[]`, `packSupply`.
- `MarketRelease` stores: `id`, `creatorName`, `coverImageUrl`, `previewClipUrl?`, `title`, `caption`, `setName`, `packsAvailable`, `packIds[]`, `priceUsd`, `listedAt`, `expiresAt`, `status`, `collectibleType`.
- Releases page filters by `status` only — no explicit content filtering.
- Discover (`MarketPage` / `mockDiscoverSets`) has engagement metadata but no `explicit` field.
- No user settings context for explicit-mode toggle exists.

## Requested Changes (Diff)

### Add

- **`UserSettingsContext`** — stores viewer's `explicitModeOn: boolean` (default `false`), persisted in localStorage. Exposes `explicitModeOn` and `setExplicitModeOn`.
- **`FinalSetupScreen`** component — the new step 10 in the capture flow. Fields: set title (required), caption (optional), explicit toggle, cover photo selector (grid of 9 captured photos), submit button. Replaces old inline review step.
- **`explicit: boolean`** field on `MomentDraft` — defaults to `false`. Also add `title: string`, `caption: string`, `coverIndex: number` to `MomentDraft`.
- Setters in `MomentDraftContext`: `setTitle`, `setCaption`, `setExplicit`, `setCoverIndex`.
- **`explicit: boolean`** field on `MarketRelease` — passed through from draft metadata at listing time.
- **`creatorId: string`**, **`createdAt: number`**, **`packCount: number`**, **`releaseStatus: string`** semantic fields — most already exist but ensure `createdAt` (= `listedAt`) and `packCount` (= `packsAvailable`) are consistently represented.
- **`explicit: boolean`** field on `MintMomentSetRank` in `mockDiscoverSets`.
- Seed data for explicit releases (2-3 items marked explicit in seed releases + discover sets).
- Explicit blur overlay component used in `MarketPage` / Discover when viewer `explicitModeOn === false`.
- Settings toggle on `ReleasesPage` header — small "Safe" / "Explicit" pill button that opens a settings row in-page or uses `UserSettingsContext` to toggle.

### Modify

- **`CaptureMomentPage`** — after video capture (step 9 → use video), instead of going to old step 10 inline review, call `onSetupComplete` (or set internal state to `'setup'`) to render the new `FinalSetupScreen`. The old review grid (step 10) is replaced by `FinalSetupScreen`.
- **`App.tsx` `handleConfirmPackPrice`** — read `draft.title`, `draft.caption`, `draft.photos[draft.coverIndex]` (or `draft.photos[0]` fallback) and `draft.explicit` and set them on the `MarketRelease` object.
- **`ReleasesPage`** — filter `activeReleases`, `endingSoon`, `newlyReleased`, `liveReleases` to exclude releases where `release.explicit === true` when viewer `explicitModeOn === false`. This filtering must happen at the data query level (applied before rendering any section), not in the JSX conditionally.
- **`ReleasesPage`** — add a discreet safe-viewing toggle (pill button near top) that surfaces the setting.
- **`mockDiscoverSets.ts`** — add `explicit?: boolean` to `MintMomentSetRank` interface; mark a few seed sets as explicit.
- **`MarketPage`** — when rendering a set card and `set.explicit === true` and viewer `explicitModeOn === false`, apply a blur overlay and display a "Explicit" label badge over the set card instead of the real media.
- **`SetPackPriceModal`** — its summary block already says "100 total packs" etc — no change needed.
- **`ReleasesMarketContext` seed data** — mark 1-2 seed releases as `explicit: true`.

### Remove

- The old inline review step (step 10) block inside `CaptureMomentPage` (the `captureStep === 10` section showing photo grid + Print Moment button). It is fully replaced by `FinalSetupScreen`.

## Implementation Plan

1. Add `explicit`, `title`, `caption`, `coverIndex` fields to `MomentDraft` and `MomentDraftContext` with setters.
2. Add `explicit: boolean` to `MarketRelease` type and seed releases.
3. Create `UserSettingsContext` with `explicitModeOn` state, persisted in localStorage.
4. Create `FinalSetupScreen` component (Minty style).
5. Update `CaptureMomentPage`: replace step-10 inline review with `FinalSetupScreen`; `onSetupComplete` fires `onMintComplete` when user submits from setup screen.
6. Update `App.tsx`: read `title`, `caption`, `coverIndex`, `explicit` from draft when building `MarketRelease`.
7. Update `ReleasesPage`: apply explicit filtering at data level, add safe-viewing toggle.
8. Add `explicit` to `MintMomentSetRank`, add blur overlay in `MarketPage`.
9. Register `UserSettingsProvider` in `App.tsx`.
