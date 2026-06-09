# Owned Manual Planning Board — Plan Brief

> Full plan: `context/changes/owned-manual-planning-board/plan.md`
> Research: `context/changes/owned-manual-planning-board/research.md`

## What & Why

This plan completes roadmap P-02: a logged-in user can add manual duties to their own planner, see scoped data on the board, and keep dynamic week switching working. The backend ownership boundary is mostly already built, so the plan focuses on frontend state and rejection handling where stale account data could still appear.

## Starting Point

P-01 added auth, planner ownership, protected duty endpoints, and logout store reset. Research found that duty ownership is covered on the backend, but successful login/register does not reset planner/duty NgRx state, and direct planner URLs rely on backend rejection without a clear route recovery path.

## Desired End State

Successful login/register clears planner and duty store state before entering `/planners`. If a user opens another user's planner URL, backend rejection leads back to `/planners` and stale board data is not shown. Manual duty creation and dynamic week switching remain intact, with tests covering the important regression paths.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Account switch state | Reset planner/duty stores on login/register success | Prevents stale planner/range caches from leaking between users. | Plan |
| Rejected direct planner URL | Redirect to `/planners` after `401`/`403`/`404` | Avoids leaving a protected board route on stale or missing data. | Plan |
| Constant duties API | Keep `/api/v1/duties/constant` user-scoped | Main board path already uses planner-scoped reads; API churn is not needed for P-02. | Plan |
| Ownership model | Keep ownership backend-first and owner-opaque in frontend DTOs | Matches P-01 and prevents board components from growing auth logic. | Research |
| Manual item model | Use existing `Duty` abstraction | No separate backend task/event surface exists. | Research |

## Scope

**In scope:**

- Reset account-owned NgRx state on auth success.
- Redirect inaccessible planner/duty loads to `/planners`.
- Preserve manual duty creation against owned route planner id.
- Preserve and test dynamic week switching behavior.
- Add P-02 smoke notes and update test-plan cookbook §6.2/§6.3.

**Out of scope:**

- Backend schema/API changes.
- `/api/v1/duties/constant` selected-planner scoping.
- Separate task/event models.
- AI, edit/delete, roles, shared planners, refresh tokens.
- Board architecture rewrite or auth logic in board components.
- New e2e framework setup.

## Architecture / Approach

Keep the data flow backend-first: token plus planner id enters generated API calls, backend enforces ownership, NgRx stores hold only permitted planner/duty data, and `PlannerComponent` passes scoped board inputs into presentational board components. The plan tightens account-boundary state transitions and API rejection handling without changing DTO ownership shape.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Auth success reset | Clears planner/duty state before `/planners` navigation | Reset order must precede resolver reads |
| 2. Rejected access recovery | Redirects rejected planner/duty loads away from stale board routes | Over-handling errors could disrupt normal owned access |
| 3. Regression coverage | Locks manual duty and dynamic week behavior with focused tests | Existing week tests have confusing loaded/not-loaded expectations |
| 4. Docs and cookbook | Records smoke path and reusable test patterns | Docs must not drift into unrelated strategy edits |

**Prerequisites:** P-01 auth/planner ownership remains in place; backend duty ownership tests stay green.
**Estimated effort:** ~2-3 focused sessions across 4 phases.

## Open Risks & Assumptions

- `401` expired-token behavior is handled only for the touched planner/duty loads in this plan; full production auth hardening remains outside P-02.
- If implementation reveals missing effect spec infrastructure, Phase 2 may need small test harness setup for planner/duty effects.
- Existing frontend lint debt may still block full lint; this plan requires build and targeted tests, with full test suite if practical.

## Success Criteria (Summary)

- Account switching through auth success does not show another user's planner or duty state.
- Direct access to another user's planner URL redirects to `/planners` and does not show stale board data.
- Manual duty creation and dynamic week switching still work for owned planners.
