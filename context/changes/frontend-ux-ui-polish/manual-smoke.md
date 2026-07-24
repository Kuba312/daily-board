# Manual Smoke: Frontend UX/UI Polish

Date: 2026-07-24
Change: `frontend-ux-ui-polish`
Scope: P-04/P-07 frontend-only UX polish for auth, authenticated side-menu actions, and no-planner empty states.

## Preconditions

- Backend is running with the current branch.
- Frontend is running against that backend.
- Browser storage can be cleared before logged-out checks.
- At least one valid test user is available, or registration is enabled for creating one.
- A no-planner account is available for empty-state checks, or planners can be removed in local data.
- A planner with enough data to check board rendering and week switching is available for non-regression checks.

## Checklist

### Auth Page Loading And Error UX

1. Clear browser storage and open `/auth`.
2. Confirm the auth page has the polished spacing, typography, focus, hover, and disabled states from this slice.
3. Submit invalid or failing login credentials.
4. Confirm a persistent inline auth error appears in the form.
5. Confirm snackbar error feedback still appears.
6. Submit login/register again and confirm stale inline error feedback clears on retry.
7. Switch between login and register modes and confirm stale inline error feedback clears.
8. Submit login/register and confirm duplicate submit is prevented while the request is in progress.
9. Confirm the submit label changes while login/register is in progress.
10. Confirm mode-switch buttons are disabled while login/register is in progress.
11. Complete a successful login or registration.

Expected: auth feedback is visible and persistent where needed, duplicate auth requests are blocked during submission, stale errors clear on retry/mode switch, and successful auth still navigates to `/planners`.

### Logged-Out Side Menu

1. Clear browser storage.
2. Open `/auth`.
3. Inspect the side menu.

Expected: logged-out users do not see create task, add planner, or logout actions.

### Logged-In Side Menu

1. Log in as a valid user.
2. Inspect the side menu on an authenticated route.
3. Click logout.

Expected: create task, add planner, and logout actions are visible after login. Logout clears visible planner/duty state and routes to `/auth`.

### Planners Dashboard Empty State

1. Log in as a user with no planners.
2. Open `/planners`.
3. Confirm the empty state has a clear title, body copy, and next action.
4. Click the empty-state create-planner action.

Expected: `/planners` explains that no planners exist and routes to planner creation through the existing `/planner-add` path.

### Task Planner Chooser Empty State

1. Log in as a user with no planners.
2. Open `/choose-planner`.
3. Confirm the empty state explains that a planner is required before adding a task.
4. Click the empty-state create-planner action.

Expected: `/choose-planner` explains the dependency on a planner and routes to planner creation through the existing `/planner-add` path.

### Planner Rendering And Selection

1. Log in as a user with at least one planner.
2. Open `/planners`.
3. Confirm planner cards render instead of the no-planner empty state.
4. Open `/choose-planner`.
5. Select a planner card.

Expected: planner cards still render, and planner selection in `/choose-planner` still enables the task creation flow.

### Board And Week Switching Non-Regression

1. Open an existing planner board.
2. Confirm duties/tasks render as before.
3. If the planner is dynamic, switch to another week.
4. Switch back to the prior week.

Expected: board rendering and dynamic week switching still behave as before this frontend polish slice.

### Explicit Non-Regression Scope

Confirm during the smoke pass that this slice does not intentionally change:

- backend behavior,
- auth API contract,
- auth business logic,
- ownership rules,
- planner or duty persistence behavior,
- AI proposal behavior,
- board architecture,
- dynamic week switching behavior.

## Result

Manual smoke passed for Phase 4 on 2026-07-24.
