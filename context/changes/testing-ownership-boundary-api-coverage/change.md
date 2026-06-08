---
change_id: testing-ownership-boundary-api-coverage
title: Ownership boundary API coverage
status: impl_reviewed
created: 2026-06-01
updated: 2026-06-08
archived_at: null
---

## Notes

Open a change folder for rollout Phase 1 of context/foundation/test-plan.md: "Ownership boundary API coverage".
Risks covered: #1 User B can access User A planner or duty through direct endpoint/manual URL even when lists are filtered; #5 Ownership scoping fails on dependent planner/duty operations across create/detail/update/delete paths.
Test types planned: backend integration/API.
Risk response intent:
- Risk #1: prove cross-user list/detail/direct access never exposes another user's planner or duty data; challenge the assumption that a filtered list means detail access and child data are safe; avoid happy-path-only ownership tests.
- Risk #5: prove dependent duty/planner operations preserve ownership on every access path; challenge the assumption that planner ownership automatically protects child data; avoid copying production query logic into assertions.
