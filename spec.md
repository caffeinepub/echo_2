# Minty — Releases Tab Layout Update

## Current State
- Filter tabs: "Live Releases", "Ending Soon", "Newly Released" in that order
- `TrendingHashtagsSection` uses `flexWrap: "wrap"` — hashtags stack into multiple rows
- Hashtags section sits below filter tabs inside the sticky header with `paddingTop: 10`
- Hashtag section has `marginBottom: 4` inside component

## Requested Changes (Diff)

### Add
- Horizontal scroll behavior to hashtag row (`overflowX: "auto"`, `flexWrap: "nowrap"`, hide scrollbar)
- Tighter vertical padding on hashtag container to reduce height used

### Modify
- `FILTER_LABELS`: rename `"Live Releases"` → `"Newest Moments"`, `"Ending Soon"` → `"Hot Packs"`
- `TrendingHashtagsSection`: change `flexWrap: "wrap"` to `flexWrap: "nowrap"`, add `overflowX: "auto"`, add scrollbar-hide CSS
- Hashtag wrapper `paddingTop: 10` → `paddingTop: 6` to tighten vertical space
- Reduce `marginBottom` inside `TrendingHashtagsSection` from 4 to 2
- Reduce pill padding slightly to keep them compact in the single row

### Remove
- Multi-row hashtag wrapping behavior

## Implementation Plan
1. In `FILTER_LABELS` array, update the two label strings
2. In `TrendingHashtagsSection`, replace `flexWrap: "wrap"` with `flexWrap: "nowrap"` + `overflowX: "auto"` on the flex container, add `-webkit-overflow-scrolling: touch`, hide scrollbar via className or inline style hack
3. Reduce vertical spacing on the hashtag wrapper div from `paddingTop: 10` to `paddingTop: 6` and `marginBottom` from 4 to 2
4. Ensure pills stay same size/style — only change is they scroll horizontally instead of wrapping
