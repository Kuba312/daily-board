---
change_id: owned-manual-planning-board
title: Owned manual planning board
status: implementing
created: 2026-06-08
updated: 2026-06-08
archived_at: null
---

## Notes

<!-- Free-form notes for this change: links, ad-hoc context, decisions that don't belong in research/frame/plan. -->
- Phase 3 manual verification blocker: adding a duty to a newly created dynamic planner failed because backend conflict detection reported conflicts with many legacy pre-auth/pre-ownership duties from older planners/data.
- Hypothesis: duty conflict detection is too broad and may not be scoped to the current owned path planner. It likely checks legacy, unowned, or other-planner duties.
- Impact: Phase 3 manual verification for dynamic planner duty creation is blocked; `3.7` and `3.8` remain pending.
- Next session: investigate `DutyService` conflict detection and the query/specification used for conflicts. Minimal expected fix is to scope conflict detection to duties from the current owned planner only, not all user/global/legacy duties.
