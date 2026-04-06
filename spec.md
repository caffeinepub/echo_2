# ECHO (Minty Pet App)

## Current State
Single-screen app showing only a PetPage with an animated old Asian man mascot and water/food/mood status bars. No navigation. No other pages.

## Requested Changes (Diff)

### Add
- A bottom tab navigation bar with two tabs: "Pet" (paw icon) and "Leaderboard" (trophy icon)
- A new LeaderboardPage showing the Top 50 longest-living Asian men in recorded history, with rank, name, country, and verified lifespan

### Modify
- App.tsx: Add tab state, render tab bar, conditionally show PetPage or LeaderboardPage

### Remove
- Nothing removed

## Implementation Plan
1. Create LeaderboardPage.tsx with a static list of top 50 longest-living Asian men (historically verified, ranked by age at death)
2. Update App.tsx to add a simple two-tab bottom nav (Pet | Leaderboard) and route between pages
3. Style consistently with existing Minty pastel aesthetic (DM Sans font, soft backgrounds, echo CSS vars)
