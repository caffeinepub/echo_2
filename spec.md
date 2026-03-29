# ECHO

## Current State
- 3 mock tracks (Obsidian, Fragments, Charcoal) in songs.ts
- AnimatedCover component supports coverMotion (MP4 URL) and motionEnabled
- Library always loops MP4 artwork
- Releases expands selected track with animated cover
- Discover shows still artwork tiles

## Requested Changes (Diff)

### Add
- 15 mock tracks (replacing the 3 existing ones), each with unique still artwork and a Pexels/public MP4 animation loop URL
- Each track: still artworkSrc image + coverMotion video URL that visually matches (video = "album art coming alive")
- Library: still art by default; on tap → animate the MP4 loop with a smooth entrance animation (scale + fade)
- Releases: animated art loops for all tracks (existing AnimatedCover, animate=true for selected, false for others)
- Discover: still image in circle with rotation animation when that track is playing in the audio player (same as current behavior)

### Modify
- songs.ts: expand from 3 to 15 mock tracks with generated artwork images and varied Pexels video loop URLs
- LibraryPage: tapping a track card should toggle its animated state — show still by default, switch to MP4 loop on tap with a cool scale-up/glow animation entrance
- Mix of owned (userEdition > 0) and unowned (userEdition: 0) tracks across the 15

### Remove
- Nothing structural removed

## Implementation Plan
1. Generate 15 unique album art images (abstract/visual art style)
2. Update songs.ts with 15 tracks, each with artworkSrc, coverMotion (different Pexels video URLs), varied metadata
3. Update LibraryPage: track a `tappedId` state; when a track is tapped, show AnimatedCover with animate=true + CSS entrance animation (scale 0.95→1, glow ring fade-in); tapping again or tapping another track collapses
4. Releases: already uses AnimatedCover — ensure all 15 tracks render correctly with animate=true for selected
5. Discover: no change needed — already shows still image with rotation when playing
