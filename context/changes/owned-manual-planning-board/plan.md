# Owned Manual Planning Board Implementation Plan

## Overview

Implement roadmap P-02 by completing the owned manual-planning path around the existing `Duty` abstraction: a logged-in user can add a duty to their own planner, see only scoped planner/duty data on the board, and keep dynamic week switching working after scoped loads and rejected access attempts.

The backend ownership boundary is already mostly in place. This plan focuses on frontend account-scoped state handling, protected route/API rejection behavior, and regression coverage for manual duty creation plus dynamic week switching.

## Current State Analysis

P-01 added authentication and planner ownership. Planner create/list/detail are backend-scoped to the current authenticated user, and duty endpoints are protected. `DutyService` resolves the path planner through the current user before creating or reading duties, and existing backend tests already cover cross-user duty create/read denial, dynamic read denial, constant-duty user filtering, body `plannerId` smuggling, conflict isolation, and missing/invalid token rejection.

The main remaining P-02 risk is frontend state consistency. Angular routes are guarded by local token presence, but the guard does not validate the token with the backend. Planner and duty store caches are keyed by planner id and date range rather than user. Logout resets planner and duty state, but successful login/register currently navigates to `/planners` without clearing previous planner/duty state. Direct URL access to another user's planner id relies on backend rejection, but current effects mostly show errors without a route-level recovery path that guarantees stale board data is not shown.

## Desired End State

After this plan is complete, successful login/register clears account-owned planner and duty store state before routing to `/planners`. Protected backend API rejection handling distinguishes invalid sessions from inaccessible resources: `401` clears persisted auth state, resets planner/duty stores, redirects to `/auth`, and keeps existing snackbar/error feedback where available; `403` and `404` for planner/duty protected resources keep the user logged in, redirect to `/planners`, and do not render stale planner/board data. Manual duty creation continues to use the route planner id and backend ownership checks, and dynamic week switching continues to fetch unloaded week ranges and preserve the selected visible week.

### Key Discoveries:

- Backend planner ownership already assigns and reads by current owner in `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:20`.
- Backend duty creation validates the owned path planner before saving in `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:29`.
- `saveDuties` overwrites the duty planner with the owned path planner, neutralizing client/body planner spoofing in `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:83`.
- Planner board routing already provides planner/duty stores and resolves duties in `frontend/src/app/views/routes.ts:29`.
- Dynamic week switching lives in `PlannerComponent.onWeekPeriodChanged` at `frontend/src/app/views/planner/planner.component.ts:89`.
- Store loaded flags are planner/range keyed, not user keyed, in `frontend/src/app/shared-store/duty-store/duty.reducer.ts:16`.
- Logout resets planner and duty stores in `frontend/src/app/shared/components/side-menu/side-menu.component.ts:46`; login/register does not currently do the same in `frontend/src/app/views/auth/auth.component.ts:71`.

## What We're NOT Doing

- No backend schema migration.
- No change to `/api/v1/duties/constant`; it remains user-scoped and is not made selected-planner scoped in P-02.
- No separate `Task` or `Event` backend model; P-02 uses the existing `Duty` abstraction.
- No AI proposal, AI acceptance, or AI persistence behavior.
- No planner/duty edit or delete endpoints.
- No owner fields in frontend DTOs or UI models.
- No auth logic inside `PlannerBoardComponent` or board header components.
- No broad board architecture rewrite.
- No new e2e framework setup.
- No production auth hardening, refresh-token flow, token refresh retry, roles, or shared planner permissions.

## Implementation Approach

Keep ownership enforcement in the backend and keep board components presentational. Tighten the frontend data boundary where account-owned data enters or leaves the UI: auth success, planner/duty effects, route resolver behavior, and store regression tests.

The implementation should prefer small, local changes. Account switches should clear account-scoped NgRx slices. Protected API rejection should split by status code: `401` means the frontend session is no longer valid and should follow the logout-style cleanup path before routing to `/auth`; planner/duty `403` and `404` mean the session is still valid but the resource is inaccessible, so route to `/planners` and avoid rendering stale board data. Dynamic week switching should keep the existing `changedWeekPeriod` and `getDutiesByRangeTimeAndPlannerId` flow while tests are corrected and expanded.

## Critical Implementation Details

### State Sequencing

On successful login/register, reset planner and duty stores before navigating to `/planners`. This ordering prevents the dashboard resolver from observing stale `allPlannersLoaded` or cached planner/duty entities from a previous account.

### User Experience Spec

When backend returns `401` from a protected API, treat it as an expired or invalid frontend session: call the existing auth-state clearing path, reset planner and duty stores, redirect to `/auth`, and preserve existing snackbar/error feedback where the failing effect already has it. When backend rejects planner/duty resource access with `403` or `404`, keep the user logged in, use the existing snackbar/error feedback pattern, and redirect to `/planners`. Do not leave the user on a board route with missing or stale planner details.

## Phase 1: Account-Scoped Store Reset On Auth Success

### Overview

Clear planner and duty NgRx state on successful login/register, matching the existing logout reset behavior and closing the stale cross-account cache path.

### Changes Required:

#### 1. Auth Component Store Reset

**File**: `frontend/src/app/views/auth/auth.component.ts`

**Intent**: Reset account-owned planner and duty state after successful authentication and before navigation to `/planners`.

**Contract**: Inject `Store`, dispatch `plannerActions.resetPlanners()` and `dutyActions.resetDuties()` in the auth success handler before `this._router.navigate(['/planners'])`. Keep existing login/register service calls, submitting state, inline error behavior, and snackbar behavior unchanged.

#### 2. Auth Component Tests

**File**: `frontend/src/app/views/auth/auth.component.spec.ts`

**Intent**: Lock in that auth success clears account-owned state before routing into protected planner pages.

**Contract**: Update the test setup to provide a store spy. Add or update login/register success tests so they assert planner reset and duty reset are dispatched before or as part of successful navigation. Keep existing tests for duplicate-submit prevention, inline errors, mode switching, and snackbar behavior passing.

### Success Criteria:

#### Automated Verification:

- Auth component tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/auth/auth.component.spec.ts'`
- Frontend build passes: `cd frontend && npm run build`

#### Manual Verification:

- Login with User A, load planners, navigate to `/auth`, login/register as User B, and verify User A planner data is not visible before User B data loads.
- Existing auth error/loading UX still behaves as before.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets; the corresponding checkboxes live in the `## Progress` section at the bottom of the plan.

---

## Phase 2: Rejected Planner Access Recovery

### Overview

Handle expired/invalid sessions and direct URL or stale-link access to a planner the current user cannot access. Backend remains the ownership source of truth; frontend effects should recover by preventing stale board display. `401` routes through auth cleanup to `/auth`; `403/404` protected-resource failures route back to `/planners`.

### Changes Required:

#### 1. Planner Detail Rejection Handling

**File**: `frontend/src/app/shared-store/planner-store/planner.effects.ts`

**Intent**: Route away from inaccessible planner detail loads when the backend rejects access.

**Contract**: In `getPlannerEffect`, when `getPlannerById` fails with `401`, preserve existing error feedback, clear auth state via the existing `AuthService.logout()` path, dispatch `plannerActions.resetPlanners()` and `dutyActions.resetDuties()`, and route to `/auth`. When it fails with `403` or `404`, preserve existing error feedback, keep the user logged in, and route to `/planners`. Continue returning `plannerActions.getPlannerFailure` with the error message. Do not change successful planner time normalization or planner DTO shape.

#### 2. Duty Load Rejection Handling

**File**: `frontend/src/app/shared-store/duty-store/duty.effects.ts`

**Intent**: Route away from inaccessible duty loads for static and dynamic planner board routes.

**Contract**: In `getDutiesByPlannerIdEffect` and `getDutiesByPlannerIdAndRangeTime`, when the backend rejects with `401`, preserve existing error feedback, clear auth state via the existing `AuthService.logout()` path, dispatch `plannerActions.resetPlanners()` and `dutyActions.resetDuties()`, and route to `/auth`. When it fails with `403` or `404`, preserve existing error feedback, keep the user logged in, and route to `/planners`. Return the matching failure action for the failed request. Do not add auth or owner filtering to board components.

#### 3. Planner/Duty Effect Tests

**Files**:

- `frontend/src/app/shared-store/planner-store/planner.effects.spec.ts`
- `frontend/src/app/shared-store/duty-store/duty.effects.spec.ts`

**Intent**: Prove protected API rejections do not leave direct-access board routes sitting on stale data, and that invalid sessions are cleared instead of treated as ordinary forbidden resources.

**Contract**: Add or update effect tests so `401` failures for planner detail, static duty load, and dynamic duty range load show existing error feedback, emit the correct failure action, clear auth state, reset planner/duty stores, and route to `/auth`. Add or update `403` and `404` tests for the same planner/duty failures so they show existing error feedback, emit the correct failure action, keep auth state intact, and route to `/planners`. If effect spec files do not exist, create focused specs following existing Angular/Ngrx test patterns in nearby component/service specs.

### Success Criteria:

#### Automated Verification:

- Planner effects tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared-store/planner-store/planner.effects.spec.ts'`
- Duty effects tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared-store/duty-store/duty.effects.spec.ts'`
- Frontend build passes: `cd frontend && npm run build`

#### Manual Verification:

- With an expired/invalid persisted token, opening a protected backend-backed route redirects to `/auth`, clears auth state, and resets planner/duty stores.
- While logged in as User B, opening a User A planner board URL redirects to `/planners` after backend `403/404` rejection.
- The rejected route does not show User A planner title or duty data.
- Normal owned planner board access still works for both constant and dynamic planners.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Manual Duty And Week-Switching Regression Coverage

### Overview

Tighten frontend coverage around the P-02 user-visible path: creating a manual duty for the route planner, rendering scoped board data, and preserving dynamic week switching after scoped data loading.

### Changes Required:

#### 1. Planner Component Week-Switching Tests

**File**: `frontend/src/app/views/planner/planner.component.spec.ts`

**Intent**: Make dynamic week-switching tests readable and trustworthy.

**Contract**: Correct the inverted test names/expectations around already-loaded versus not-loaded ranges. Add coverage that a not-loaded dynamic week dispatches `getDutiesByRangeTimeAndPlannerId` and updates `fromDate`/`toDate`, while an already-loaded range updates the visible range without a duplicate fetch. Preserve tests for animation direction and planner detail loading.

#### 2. Duty Reducer/Selector Regression Tests

**Files**:

- `frontend/src/app/shared-store/duty-store/duty.reducer.spec.ts`
- `frontend/src/app/shared-store/duty-store/duty.selectors.ts`

**Intent**: Protect the planner/range cache behavior that dynamic board switching depends on.

**Contract**: Add or adjust reducer tests for static planner load, dynamic range load, duplicate range prevention, and reset behavior. Selector implementation should only change if tests reveal a real bug; do not make user-scoped cache keys in P-02 because account resets handle the user boundary.

#### 3. Task Board Form Tests

**File**: `frontend/src/app/views/task-board-form/task-board-form.component.spec.ts`

**Intent**: Preserve the manual-duty creation contract under authenticated ownership.

**Contract**: Ensure tests assert `saveDuty` dispatch uses the route `plannerId`, includes the generated duty payload, and sets `plannerType` correctly for constant and dynamic planners. Do not add owner fields or frontend user filtering.

### Success Criteria:

#### Automated Verification:

- Planner component tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/planner/planner.component.spec.ts'`
- Duty reducer tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared-store/duty-store/duty.reducer.spec.ts'`
- Task board form tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/task-board-form/task-board-form.component.spec.ts'`
- Frontend test suite passes if practical: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
- Frontend build passes: `cd frontend && npm run build`

#### Manual Verification:

- User can create a duty for an owned constant planner and see it on that planner board.
- User can create dated duties for an owned dynamic planner and see them on the correct week.
- Switching weeks on a dynamic planner still fetches unloaded ranges and does not duplicate requests for already-loaded ranges.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 4: Verification Notes And Test Cookbook Update

### Overview

Document the P-02 manual smoke path and fill the frontend auth/session plus board/week-switching cookbook sections started by the risk-first test plan.

### Changes Required:

#### 1. Manual Smoke Checklist

**File**: `context/changes/owned-manual-planning-board/manual-smoke.md`

**Intent**: Capture the end-to-end human verification path for P-02.

**Contract**: Document preconditions and steps for User A/User B ownership, manual duty creation on constant and dynamic planners, expired/invalid token cleanup, direct cross-user planner URL rejection, auth-success state reset, and dynamic week switching. Do not write to `context/archive/`.

#### 2. Test Plan Cookbook

**File**: `context/foundation/test-plan.md`

**Intent**: Replace the relevant TBD cookbook entries with concrete frontend testing patterns learned in this slice.

**Contract**: Update §6.2 and §6.3 only. Add locations, naming guidance, reference tests, and run commands for frontend auth/session state coverage and board/week-switching regression coverage. Keep strategy §1-§5 unchanged.

#### 3. Final Progress Updates

**File**: `context/changes/owned-manual-planning-board/plan.md`

**Intent**: Record verification state as implementation lands.

**Contract**: During implementation, update only the `## Progress` checkboxes and append commit hashes when steps land. Do not rewrite scope or phases without an explicit plan revision.

### Success Criteria:

#### Automated Verification:

- Auth component tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/auth/auth.component.spec.ts'`
- Planner effects tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared-store/planner-store/planner.effects.spec.ts'`
- Duty effects tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared-store/duty-store/duty.effects.spec.ts'`
- Planner component tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/planner/planner.component.spec.ts'`
- Task board form tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/task-board-form/task-board-form.component.spec.ts'`
- Frontend test suite passes if practical: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
- Frontend build passes: `cd frontend && npm run build`

#### Manual Verification:

- Manual smoke checklist exists and covers auth-success reset, expired/invalid token cleanup, direct cross-user URL rejection, manual duty creation, and dynamic week switching.
- `context/foundation/test-plan.md` §6.2 and §6.3 no longer say only `TBD`.
- Cookbook entries read as reusable testing guidance, not a one-off implementation log.

**Implementation Note**: This phase is verification/documentation only. It should not introduce new runtime feature scope.

---

## Testing Strategy

### Unit Tests:

- `AuthComponent`: successful login/register dispatches planner and duty reset before protected navigation.
- `planner.effects`: `401` planner detail failures emit failure, show existing error feedback, clear auth state, reset planner/duty stores, and redirect to `/auth`; `403/404` failures keep auth state and redirect to `/planners`.
- `duty.effects`: `401` static and dynamic duty load failures emit matching failures, show existing error feedback, clear auth state, reset planner/duty stores, and redirect to `/auth`; `403/404` failures keep auth state and redirect to `/planners`.
- `PlannerComponent`: dynamic week switching dispatches only for unloaded ranges and always updates visible week range.
- `duty.reducer`: static planner loads, dynamic range loads, duplicate range prevention, and reset behavior.
- `TaskBoardFormComponent`: manual duty save dispatch uses route planner id and correct planner type.

### Integration Tests:

- No new backend integration tests are required unless implementation touches backend ownership code. Existing `DutyOwnershipTest` already covers backend P-02 ownership boundaries.
- No new e2e framework setup in this slice. Manual smoke covers the full user flow until Phase 4 of the test rollout introduces critical-flow e2e.

### Manual Testing Steps:

1. Log in/register as User A and create or use an owned planner.
2. Add a manual duty to a constant planner and verify it appears on that planner board.
3. Add dated manual duties to a dynamic planner and verify they appear on the correct week.
4. Switch to another dynamic week, verify unloaded ranges fetch and already-loaded ranges do not duplicate fetches.
5. Navigate to `/auth`, log in/register as User B without using logout, and verify User A planner/duty data is not visible.
6. With an expired/invalid persisted token, open a protected backend-backed route and verify auth state is cleared, planner/duty stores reset, and navigation goes to `/auth`.
7. While logged in as User B, open a known User A planner board URL and verify redirect to `/planners`.
8. Log back in as User A and verify User A's planner/duty data remains accessible.

## Performance Considerations

No significant performance work is planned. Store resets on auth success are small local state operations. Dynamic week switching should keep the existing range-cache behavior so already-loaded week ranges do not refetch unnecessarily.

## Migration Notes

No database migration, API migration, or generated-client regeneration is planned. Existing development/test data assumptions from the roadmap still apply.

## References

- Research: `context/changes/owned-manual-planning-board/research.md`
- Roadmap P-02: `context/foundation/roadmap.md`
- Test plan risks/cookbook: `context/foundation/test-plan.md`
- Auth success path: `frontend/src/app/views/auth/auth.component.ts:71`
- Logout reset precedent: `frontend/src/app/shared/components/side-menu/side-menu.component.ts:46`
- Planner effects: `frontend/src/app/shared-store/planner-store/planner.effects.ts:93`
- Duty effects: `frontend/src/app/shared-store/duty-store/duty.effects.ts:118`
- Dynamic week switching: `frontend/src/app/views/planner/planner.component.ts:89`
- Duty ownership backend tests: `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:53`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Account-Scoped Store Reset On Auth Success

#### Automated

- [x] 1.1 Auth component tests pass
- [x] 1.2 Frontend build passes

#### Manual

- [ ] 1.3 Login/register as User B after User A state does not show User A planner data
- [ ] 1.4 Existing auth error/loading UX still behaves as before

### Phase 2: Rejected Planner Access Recovery

#### Automated

- [x] 2.1 Planner effects tests pass
- [x] 2.2 Duty effects tests pass
- [x] 2.3 Frontend build passes

#### Manual

- [x] 2.4 Expired/invalid token access clears auth state, resets planner/duty stores, and redirects to `/auth`
- [x] 2.5 User B opening a User A planner board URL redirects to `/planners`
- [x] 2.6 Rejected route does not show User A planner title or duty data
- [x] 2.7 Normal owned planner board access still works for constant and dynamic planners

### Phase 3: Manual Duty And Week-Switching Regression Coverage

#### Automated

- [ ] 3.1 Planner component tests pass
- [ ] 3.2 Duty reducer tests pass
- [ ] 3.3 Task board form tests pass
- [ ] 3.4 Frontend test suite passes if practical
- [ ] 3.5 Frontend build passes

#### Manual

- [ ] 3.6 User can create a duty for an owned constant planner and see it on that planner board
- [ ] 3.7 User can create dated duties for an owned dynamic planner and see them on the correct week
- [ ] 3.8 Dynamic week switching fetches unloaded ranges and avoids duplicate requests for already-loaded ranges

### Phase 4: Verification Notes And Test Cookbook Update

#### Automated

- [ ] 4.1 Auth component tests pass
- [ ] 4.2 Planner effects tests pass
- [ ] 4.3 Duty effects tests pass
- [ ] 4.4 Planner component tests pass
- [ ] 4.5 Task board form tests pass
- [ ] 4.6 Frontend test suite passes if practical
- [ ] 4.7 Frontend build passes

#### Manual

- [ ] 4.8 Manual smoke checklist exists and covers P-02 acceptance path
- [ ] 4.9 Test plan §6.2 and §6.3 no longer say only `TBD`
- [ ] 4.10 Cookbook entries read as reusable testing guidance
