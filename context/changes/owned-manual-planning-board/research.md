---
date: 2026-06-08T18:53:45+02:00
researcher: Codex
git_commit: 5c75bf478fbfc0fe24414330b669d2f81365ab6d
branch: DB-54
repository: daily-board
topic: "Owned manual planning board"
tags: [research, codebase, angular, spring-boot, ownership, board, duties]
status: complete
last_updated: 2026-06-08
last_updated_by: Codex
---

# Research: Owned Manual Planning Board

**Date**: 2026-06-08T18:53:45+02:00
**Researcher**: Codex
**Git Commit**: 5c75bf478fbfc0fe24414330b669d2f81365ab6d
**Branch**: DB-54
**Repository**: daily-board

## Research Question

Research roadmap P-02, `owned-manual-planning-board`: user can add task/event/duty to their own planner; board/calendar shows only scoped data; dynamic week switching remains preserved.

## Summary

P-02 is partly implemented already. Backend planner ownership exists, duty endpoints are protected, and duty service methods check the authenticated user's planner before creating or reading duties. The main remaining P-02 risks are on the frontend data-loading boundary: stale NgRx cache across account changes, direct URL access to another user's planner id, resolver/effect error handling when the backend rejects access, and regression coverage around dynamic week switching.

There is no separate backend `Task` or `Event` surface. The current manual planning item is `Duty`, and P-02 should treat duty as the existing task/event abstraction unless product scope explicitly changes.

The plan should keep ownership enforcement in backend services and NgRx effects/resolvers. Board components should remain presentational and consume already-scoped planner/duty data.

## Detailed Findings

### Product Scope

- Roadmap P-02 is: "User can add task/event/duty to own planner; board/calendar shows only scoped data with week switching preserved" (`context/foundation/roadmap.md:30`).
- The roadmap guardrail says to scope data before it reaches the board and avoid board auth logic (`context/foundation/roadmap.md:44`, `context/foundation/roadmap.md:69`).
- The PRD requires board/calendar to show only the logged-in user's data and preserve dynamic week switching (`context/foundation/prd.md:69`, `context/foundation/prd.md:93`).
- AI proposal, AI acceptance, edit/delete, shared planners, roles, and production auth hardening are out of P-02 scope (`context/foundation/roadmap.md:73`, `context/foundation/roadmap.md:76`, `context/foundation/roadmap.md:84`).

### Backend Ownership And Duty Paths

- `JwtAuthenticationFilter` validates bearer tokens, loads a `User`, and stores that domain user as the Spring Security principal (`backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/config/JwtAuthenticationFilter.java:45`, `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/config/JwtAuthenticationFilter.java:56`).
- `AuthenticatedUserService` centralizes current-user lookup from the security context (`backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/AuthenticatedUserService.java:12`).
- Planner creation assigns the current user, and planner list/detail reads use owner-scoped repository methods (`backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:20`, `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:26`, `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:30`).
- Duty creation is path-planner driven through `POST /api/v1/duties/{plannerId}` (`backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/DutyController.java:32`).
- `DutyService.save` resolves the path planner through `getCurrentUserPlanner` before conflict checks or save (`backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:29`).
- `saveDuties` overwrites each duty's planner with the owned path planner, which neutralizes body `plannerId` tampering (`backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:83`).
- Static and dynamic board duty reads both validate planner ownership before querying duties (`backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:37`, `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:43`).
- Constant-duty read is user-scoped through `findByEffectiveDateIsNullAndPlannerOwnerId` (`backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:49`, `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/repository/DutyRepository.java:16`).

### Backend Gaps And Constraints

- `DutyRepository.findByPlannerIdAndEffectiveDateBetween` and `findByPlannerId` are not owner-scoped by themselves (`backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/repository/DutyRepository.java:14`, `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/repository/DutyRepository.java:18`). Current service usage guards them first; P-02 should not add direct callers that bypass `DutyService`.
- `/api/v1/duties/constant` is owner-scoped but not selected-planner scoped. It does not appear to be used by the main board resolver path, so avoid using it to render a selected planner unless that broader behavior is intended.
- Conflict detection is safe after planner ownership validation, but the `findAll(spec)` query itself is not owner-scoped (`backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:56`, `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:69`).
- No backend edit/delete endpoints exist for planners or duties; that belongs to P-05 (`backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/DutyController.java:32`, `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/PlannerController.java:29`).

### Frontend Routing And Auth Boundary

- Protected routes already cover planner dashboard, planner board, planner chooser, task form, and planner form through `authGuard` (`frontend/src/app/views/routes.ts:29`, `frontend/src/app/views/routes.ts:43`, `frontend/src/app/views/routes.ts:55`, `frontend/src/app/views/routes.ts:68`, `frontend/src/app/views/routes.ts:80`).
- `authGuard` only checks local auth state/token presence and redirects to `/auth`; it does not validate the token against the backend (`frontend/src/app/core/auth/auth.guard.ts:5`).
- `authInterceptor` attaches `Authorization` only to configured backend API requests and skips assets/non-API URLs (`frontend/src/app/core/auth/auth.interceptor.ts:8`, `frontend/src/app/core/auth/auth.interceptor.ts:13`, `frontend/src/app/core/auth/auth.interceptor.ts:27`).
- Frontend generated `PlannerDto` and `DutyDto` do not expose owner fields, which matches the P-01 decision to keep ownership server-side (`frontend/src/api/models/planner-dto.ts:5`, `frontend/src/api/models/duty-dto.ts:5`).

### Frontend Planner And Duty Loading

- `plannersResolver` dispatches planner list loading when the store says planners are not loaded, and the effect calls the generated planner service (`frontend/src/app/resolvers/planners.resolver.ts:18`, `frontend/src/app/shared-store/planner-store/planner.effects.ts:61`).
- The planner board route provides planner/duty feature state and resolves duties before activation (`frontend/src/app/views/routes.ts:29`, `frontend/src/app/views/routes.ts:32`, `frontend/src/app/views/routes.ts:38`).
- `dutiesResolver` fetches only the current week for dynamic planners and all planner duties for constant planners (`frontend/src/app/views/planner/duties.resolver.ts:27`, `frontend/src/app/views/planner/duties.resolver.ts:61`, `frontend/src/app/views/planner/duties.resolver.ts:73`).
- `DutyEffects` uses generated API calls for save, static read, dynamic read, and constant duty read (`frontend/src/app/shared-store/duty-store/duty.effects.ts:35`, `frontend/src/app/shared-store/duty-store/duty.effects.ts:86`, `frontend/src/app/shared-store/duty-store/duty.effects.ts:118`, `frontend/src/app/shared-store/duty-store/duty.effects.ts:151`).
- Task creation is route-param scoped: `TaskBoardFormComponent` reads `plannerId`, loads that planner, and dispatches `saveDuty` with the path planner id (`frontend/src/app/views/task-board-form/task-board-form.component.ts:69`, `frontend/src/app/views/task-board-form/task-board-form.component.ts:115`).
- The task planner chooser routes to `/task-board-add/:plannerId` using a planner selected from the current planner store (`frontend/src/app/views/task-planner-chooser/task-planner-chooser.component.ts:44`, `frontend/src/app/views/task-planner-chooser/task-planner-chooser.component.ts:91`).

### Board And Week Switching

- `PlannerComponent` owns dynamic week switching. It checks whether a week range is loaded, dispatches `getDutiesByRangeTimeAndPlannerId` when missing, then updates `fromDate` and `toDate` (`frontend/src/app/views/planner/planner.component.ts:89`, `frontend/src/app/views/planner/planner.component.ts:102`, `frontend/src/app/views/planner/planner.component.ts:129`).
- `PlannerComponent` selects duties by planner id or by planner id plus date range, groups them, and passes the grouped map into `PlannerBoardComponent` (`frontend/src/app/views/planner/planner.component.ts:63`, `frontend/src/app/views/planner/planner.component.ts:142`).
- `PlannerBoardComponent` is presentational: it receives `dailyBoardDuties`, `plannerDetails`, and `isDynamic`, then emits week changes (`frontend/src/app/shared/components/planner-board/planner-board.component.ts:66`, `frontend/src/app/shared/components/planner-board/planner-board.component.ts:75`).
- Store cache keys are planner id and planner id plus date range, not user scoped (`frontend/src/app/shared-store/duty-store/duty.reducer.ts:16`, `frontend/src/app/shared-store/duty-store/duty.reducer.ts:17`, `frontend/src/app/shared-store/duty-store/duty.selectors.ts:35`).
- Logout resets planner and duty stores (`frontend/src/app/shared/components/side-menu/side-menu.component.ts:46`). Successful login/register currently navigates to `/planners` without clearing prior planner/duty store state (`frontend/src/app/views/auth/auth.component.ts:71`).

### Test Coverage Observations

- Backend `DutyOwnershipTest` already covers owner create/read, cross-user create/read block, dynamic read block, constant-duty owner filtering, body `plannerId` smuggling, cross-user conflict isolation, and missing/invalid token rejection (`backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:53`, `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:70`, `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:94`, `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:110`, `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:137`, `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:157`, `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:177`).
- Existing `PlannerComponent` tests cover dynamic week dispatch and date updates, but two test names appear inverted relative to their expectations around loaded vs not-loaded ranges (`frontend/src/app/views/planner/planner.component.spec.ts:143`, `frontend/src/app/views/planner/planner.component.spec.ts:168`).
- `TaskBoardFormComponent` tests cover static and dynamic duty save dispatches, including `plannerId`, redirect behavior, and planner type (`frontend/src/app/views/task-board-form/task-board-form.component.spec.ts:198`, `frontend/src/app/views/task-board-form/task-board-form.component.spec.ts:291`, `frontend/src/app/views/task-board-form/task-board-form.component.spec.ts:328`).
- Test-plan risk #2 is dynamic board/week switching after scoped loading, and risk #4 is stale/misleading frontend auth/session state after API rejection (`context/foundation/test-plan.md:47`, `context/foundation/test-plan.md:49`).

## Code References

- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:20` - Planner create assigns current owner.
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:29` - Duty save verifies owned planner before saving.
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:83` - Path planner overwrites any client/body planner reference.
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/repository/DutyRepository.java:14` - Unscoped dynamic duty repository method, safe only behind service guard.
- `frontend/src/app/views/routes.ts:29` - Planner board route is guarded and provides planner/duty stores.
- `frontend/src/app/views/planner/duties.resolver.ts:61` - Dynamic planner resolver dispatches current-week duty load.
- `frontend/src/app/views/planner/planner.component.ts:89` - Dynamic week switching event handler.
- `frontend/src/app/shared-store/duty-store/duty.reducer.ts:16` - Loaded planner/range state is keyed by planner/range, not user.
- `frontend/src/app/views/auth/auth.component.ts:71` - Login/register success navigates without clearing existing store data.
- `frontend/src/app/shared/components/side-menu/side-menu.component.ts:46` - Logout clears planner and duty stores.

## Architecture Insights

- The intended ownership model is backend-first: frontend sends bearer token plus planner id; backend resolves ownership and returns only permitted data.
- The board architecture is already mostly correct for P-02. `PlannerComponent` is the data boundary; `PlannerBoardComponent` is a renderer and should not learn auth or owner concepts.
- NgRx loaded flags are the fragile boundary. Because feature state is keyed by planner ids and ranges, stale cache is safe only if stores are reset on all account-change paths or rejected API responses clear/replace relevant state.
- Direct URL access to another user's planner id is an expected hostile path. It should be handled by backend 404/401 plus frontend effect/resolver behavior that avoids showing stale protected data.
- Constant duties are user-scoped but not selected-planner-scoped; keep them out of selected planner board rendering unless product scope explicitly says constants are global per user.

## Historical Context

- P-01 established backend-owned security as source of truth and intentionally kept owner fields out of planner DTOs (`context/changes/minimal-account-owned-planner/plan.md:19`, `context/changes/minimal-account-owned-planner/plan.md:203`).
- P-01 documented a known limitation: expired persisted tokens produce `401`, but frontend does not automatically clear auth state or redirect (`context/changes/minimal-account-owned-planner/plan.md:474`).
- P-01 added logout store reset to prevent User A planner/duty data from remaining visible to User B (`context/changes/minimal-account-owned-planner/plan.md:353`, `context/changes/minimal-account-owned-planner/plan.md:554`).
- The implementation review found duty endpoints were a real ownership bypass before they were fixed and tested (`context/changes/minimal-account-owned-planner/reviews/impl-review.md:23`, `context/changes/minimal-account-owned-planner/reviews/impl-review.md:35`).
- The archived Phase 1 ownership test rollout added backend coverage for dynamic duties, constant duties, body `plannerId` smuggling, cross-user conflicts, and auth rejection (`context/archive/2026-06-01-testing-ownership-boundary-api-coverage/plan.md:195`, `context/archive/2026-06-01-testing-ownership-boundary-api-coverage/plan.md:211`).
- The test plan says frontend auth/session and board/week cookbook sections are still TBD and should be filled by Phase 2-style work (`context/foundation/test-plan.md:183`, `context/foundation/test-plan.md:188`).

## Related Research

- `context/changes/minimal-account-owned-planner/plan.md` - P-01 auth and planner ownership implementation plan.
- `context/changes/minimal-account-owned-planner/reviews/impl-review.md` - P-01 implementation review, including original duty ownership bypass.
- `context/archive/2026-06-01-testing-ownership-boundary-api-coverage/research.md` - Backend ownership test rollout research.
- `context/foundation/test-plan.md` - Risk-first testing strategy and cookbook state.

## Open Questions

- Should successful login/register always reset planner and duty stores before navigating to `/planners`, or is logout the only supported account-switch path?
- Should direct access to another user's planner id redirect to `/planners`, show an error state, or remain snackbar-only?
- Is `/api/v1/duties/constant` intentionally user-global, or should P-02 introduce selected-planner scoping for any UI path that uses constant duties?
- Does "task/event/duty" in P-02 mean the existing `Duty` abstraction only, or should separate task/event language be introduced in UI/API later?
