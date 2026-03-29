# ECHO — Community Submissions & Admin Review Queue

## Current State
- `AdminReleasesContext` manages all releases in localStorage with statuses: `draft | scheduled | live | archived`
- `ManageReleasesPage` is admin-only (gated by `ADMIN_WALLET_ADDRESS`). Non-admins see "Access Denied".
- `useReleasesData` filters only `live` or `scheduled` (non-private) releases into public feeds (Releases, Discover, Library)
- No mechanism for non-admin wallets to submit releases for review
- `TopBar` shows a "Manage" button only to admin wallet

## Requested Changes (Diff)

### Add
- New status value `"submitted"` and `"rejected"` to `ReleaseStatus` type
- `submittedBy?: string` (wallet address) and `submittedAt?: string` (ISO timestamp) fields to `AdminRelease`
- `submitRelease()` method on `AdminReleasesContext` — saves a release with `status: "submitted"`, `visibility: "private"`, `submittedBy: walletAddress`
- `rejectRelease(id)` method on context — sets status to `"rejected"`
- `approveRelease(id, targetStatus)` method on context — sets status to `"draft"` or `"live"`
- **Creator Upload flow**: Non-admin connected wallets see an "Upload" button in `TopBar` (instead of Manage). Clicking opens the same release form in a trimmed-down "creator submission" mode — no rights/visibility/status admin controls. On submit, calls `submitRelease()` and shows confirmation: "Your release was submitted for review."
- **Creator Status Page**: After submission, a non-admin user can tap the Upload button again to see their own submissions with status badges (Submitted / Approved / Rejected). They cannot edit or self-publish.
- **Submitted filter tab** in `ManageReleasesPage` filter pills: `All | Draft | Scheduled | Live | Archived | Submitted`
- **Incoming Submissions section** inside admin Manage page: clearly labeled "Incoming Submissions" above the submitted queue, styled as an inbox feel
- **Submission review card** shows: title, creator name, submitting wallet address (truncated), uploaded video/audio file name, motion artwork indicator, price per mint, total supply, genre, description, submission timestamp
- **Admin actions per submission**: Approve (→ choose Draft or Live), Edit, Reject, Delete
- Approve modal/dropdown lets admin choose: "Publish now" (→ live) or "Save as Draft" (→ draft) or "Schedule" (→ scheduled, prompts for date)

### Modify
- `ReleaseStatus` type: add `"submitted" | "rejected"`
- `AdminRelease` interface: add `submittedBy?`, `submittedAt?` fields
- `useReleasesData`: ensure `submitted` and `rejected` statuses are excluded from all public feeds
- `ManageReleasesPage`: add `"submitted"` filter pill, render submissions as an inbox-style section when `filterStatus === "submitted"` or `"all"` (grouped separately from admin's own releases)
- `TopBar`: show "Upload" button to non-admin connected wallets instead of hiding all release management
- `FILTER_PILLS` in ManageReleasesPage: include `{ id: "submitted", label: "Submitted" }`
- `STATUS_LABELS`: add `submitted: "Submitted"`, `rejected: "Rejected"`
- `StatusBadge`: add styling for `submitted` (amber/gold) and `rejected` (red)

### Remove
- The "Access Denied" screen should not show for the Upload flow — non-admin users get an upload/submission UI, not a wall

## Implementation Plan
1. Update `AdminReleasesContext.tsx`: extend types, add `submittedBy`/`submittedAt` fields, add `submitRelease`, `rejectRelease`, `approveRelease` methods
2. Update `useReleasesData.ts`: explicitly exclude `submitted` and `rejected` from public feeds
3. Update `TopBar.tsx`: show "Upload" button for non-admin connected wallets
4. Create `CreatorSubmitPage.tsx`: stripped form for non-admin submissions, with success confirmation and submission status view
5. Update `ManageReleasesPage.tsx`:
   - Add `submitted`/`rejected` to status types and pills
   - Add inbox-style rendering for submitted items (labeled "Incoming Submissions")
   - Add approve modal with Draft/Live/Schedule choice
   - Add reject action
   - Ensure admin's own releases and community submissions are visually separated
6. Update `App.tsx` to route to `CreatorSubmitPage` when non-admin clicks Upload
