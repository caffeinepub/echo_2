# Minty — Pack Reveal Flow (Mobile)

## Current State

The Collection page has a two-tap flow for sealed packs:
1. First tap → shows an inline metadata panel beneath the tile
2. Second tap → opens `PackDetailSheet` (a bottom sheet) with pack info and an "Open Pack" button

When "Open Pack" is tapped, `openPack(packId)` is called on `CollectionContext`. On success it sets `openedNFT` state inside `PackDetailSheet`, which renders `PackOpeningOverlay` as a portal.

The existing `PackOpeningOverlay` plays a 4-phase auto-advancing animation (lift → flip → particles → card rise → action button). It does NOT have a "Slide to Open" mechanic — the animation triggers automatically. The flow bypasses the sheet entirely; when "Add to Collection" is tapped, `onComplete` is called and the sheet closes.

Gaps in the current implementation:
- No "Slide to Open" control — the animation plays automatically without user interaction
- No fullscreen background blur of the Collection page content behind the overlay
- No anticipation/vibration phase before the tear animation
- No tear-open animation (wrapper splits, light spills out)
- No suspense silhouette state between tear and reveal
- The overlay auto-advances through phases without the user's "slide" gesture triggering anything
- Only one CTA ("Add to Collection") — no "View NFT" vs "Back to Collection" split
- No creator name in the revealed metadata
- Video NFTs immediately play video, instead of showing cover image first with a video badge

## Requested Changes (Diff)

### Add
- **Fullscreen modal entry**: When user taps a sealed pack (first tap is fine, but the pack reveal should open directly, not require a second tap through the bottom sheet — the sheet can remain as an intermediate step, but the sheet's "Open Pack" button triggers the new overlay)
- **Slide to Open control**: Premium horizontal slider at the bottom of the overlay. Drag past 85% to trigger the opening sequence. Before sliding, the pack is centered with a soft animated glow. Slider uses a mint gradient track and smooth white knob.
- **Anticipation phase** (on slide complete): Pack vibrates subtly (CSS translateX shake), inner glow intensifies, brief ~400ms build-up before tear
- **Tear animation**: The pack wrapper splits — two halves animate apart (top half slides up, bottom half slides down, or diagonal tear), soft warm/mint light spills from the center seam. Duration ~600ms.
- **Suspense silhouette state**: After the tear clears, a hidden NFT card silhouette appears in the center for ~800ms. Card-shaped frosted glass / dark shape with a subtle pulse. Builds anticipation.
- **Card reveal**: NFT card rises/scales into view from the silhouette. For image NFTs: clean card with cover image and a shine sweep. For video NFTs: show the cover image (static), overlay a small refined video badge (play icon + "VIDEO" label) — do NOT autoplay video in the reveal.
- **Metadata fade-in**: After card settle, fade in: title, rarity pill, edition number (e.g. "#23 of 90"), creator name
- **Two action buttons**: "View NFT" (primary, mint gradient) and "Back to Collection" (ghost/secondary). "View NFT" calls `onComplete(nft)` and navigates to the NFT detail. "Back to Collection" calls `onComplete(nft)` and dismisses.
- **Background**: Entire overlay is fixed fullscreen, `backdrop-filter: blur(18px)` over a near-black semi-transparent layer so the Collection page content is softly visible and dimmed beneath

### Modify
- **`PackOpeningOverlay`**: Full redesign of this component to implement the new 6-phase flow: `idle` → `sliding` → `anticipation` → `tear` → `suspense` → `reveal` → `action`. Replace the existing auto-advancing animation with user-driven Slide to Open.
- **Phase transitions**: Each phase now waits for the prior phase to complete (or for user interaction in `idle`/`sliding`) before advancing
- **`PackDetailSheet`**: Keep the sheet as the detail/info view, but rename the "Open Pack" button action to directly fire the new overlay (existing wiring stays — `openedNFT` triggers `PackOpeningOverlay`)
- **Video NFT reveal**: Show `nft.imageUrl` as a static image (not a `<video>` element) with a refined video badge overlay. The video badge is a pill: small play circle icon + "VIDEO" text, mint-tinted, in the bottom-right of the card.

### Remove
- The existing auto-play phase logic (lift → flip → particles → reveal → action auto-advancing with setTimeout)
- The single "Add to Collection" CTA
- The `<video>` autoplay on card reveal for video NFTs

## Implementation Plan

1. **Redesign `PackOpeningOverlay`** as a new 6-phase component:
   - Phase `idle`: Fullscreen overlay renders. Pack card animates to center with a gentle float + soft glow. Background blurs.
   - Phase `sliding`: Slide to Open track visible at bottom. User drags. Pack glows stronger as slide progresses.
   - Phase `anticipation`: Slide completes. Pack vibrates (short shake keyframe), inner glow pulses and intensifies. ~400ms auto-advance.
   - Phase `tear`: Two halves of the pack animate apart (pseudo-element or two absolutely positioned divs showing the same image, split at midpoint). Warm mint light spills from gap. ~600ms auto-advance.
   - Phase `suspense`: Pack halves fade out. Dark card-shaped silhouette appears with a soft pulse. ~800ms auto-advance.
   - Phase `reveal`: Silhouette scales/fades as the NFT card rises into place. Shine sweep for Rare cards. Static image for both photo and video NFTs.
   - Phase `action`: Metadata fades in (title, rarity, edition, creator). "View NFT" and "Back to Collection" buttons slide up.

2. **Slide to Open control**:
   - Custom draggable control — a wide track with a circular knob
   - Uses `onPointerDown`/`onPointerMove`/`onPointerUp` for unified touch + mouse
   - Track fills with mint gradient as the knob moves right
   - At 85%+ threshold: auto-advance to `anticipation` phase
   - If released below threshold: knob snaps back
   - Track label: "Slide to Open" fades out as slider approaches threshold

3. **Tear animation**:
   - Render the pack image in two `<div>` containers: top half (`overflow: hidden`, only shows top 50%) and bottom half (only shows bottom 50%)
   - On `tear` phase: top half translates up + rotates slightly, bottom half translates down + rotates slightly
   - A central glow div expands from the split line

4. **Suspense silhouette**:
   - A `4/5` aspect-ratio div with dark frosted glass background and subtle card-shaped border
   - Pulsing opacity animation
   - No image shown — pure shape hint

5. **Card reveal**:
   - Same 4/5 card container as now but image appears via scale + fade from the silhouette position
   - For video NFTs: `<img>` with `nft.imageUrl`, plus a bottom-right badge: `◉ VIDEO`
   - Shine sweep on all Rare pulls

6. **Metadata**: Staggered fade-in below card: title → rarity pill → edition string → creator name

7. **Action buttons**: Two full-width pill buttons, stacked. Primary = "View NFT" (mint gradient). Secondary = "Back to Collection" (transparent, mint border, off-white text). Both call `onComplete(nft)` then close.

8. **Keyboard**: Escape closes when in `action` phase.

9. **No changes** to `CollectionContext`, `SealedPack`, `CollectionNFT` types, or the wiring in `CollectionPage.tsx`.
