---
change_id: owned-manual-planning-board
title: Owned manual planning board
status: archived
created: 2026-06-08
updated: 2026-06-09
archived_at: 2026-06-09T17:56:33Z
---

## Notes

<!-- Free-form notes for this change: links, ad-hoc context, decisions that don't belong in research/frame/plan. -->
- Active Phase 3 blocker: adding a dated duty to a newly created dynamic planner can be rejected with conflicts against old legacy/pre-auth duties from other planners/data.
- Phase 3 manual rows `3.7` and `3.8` must remain pending until the conflict detection bug is fixed and retested.
- Do not mark P-02 complete until this blocker is resolved.
- Expected behavior: conflict detection for adding a duty to planner X compares only with duties belonging to planner X. Duties from other planners, other users, or legacy/unowned planner data must not block the current owned planner.
- Backend fix implemented on 2026-06-09; `3.7` and `3.8` remain pending until manual retest confirms the legacy-data scenario no longer reproduces.
- Follow-up board display fix implemented on 2026-06-09: after saving a dynamic dated duty, the frontend redirects to the board with the saved duty's week range so the board loads and displays the correct week instead of defaulting to the current week. `3.7` and `3.8` still require manual retest.
- Follow-up dynamic task form validation fix implemented on 2026-06-09: dynamic planner save now requires at least one added date chip, so typing a date without clicking "Add date" no longer submits an empty duty payload.
- Phase 3 manual retest passed on 2026-06-09: dynamic dated duty creation displays on the correct week, week switching still works, and a user sees their own dynamic planners with duties.
