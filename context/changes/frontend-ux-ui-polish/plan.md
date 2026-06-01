# Frontend UX/UI Polish Implementation Plan

## Overview

Implement P-07 from the Daily Board roadmap as a frontend-only UX/UI polish slice. The work improves the existing login/register experience, hides authenticated-only side-menu actions when logged out, and makes the planner-related empty states clearer without changing backend behavior, auth business logic, ownership rules, AI behavior, or board/week switching.

## Current State Analysis

P-01 introduced the minimal auth shell and explicitly left UI roughness for a later slice. The frontend now has route guarding, token persistence, login/register UI, side-menu logout, and planner empty-state messages, but the UX is intentionally basic.

The auth page uses a plain form, hardcoded labels, snackbar-only auth failure feedback, and a submit button that only disables during submission. The side menu always renders create task, add planner, and logout actions, even when the user is not authenticated. Planner empty states exist in `/planners` and `/choose-planner`, but they are duplicated, text-only, and not very instructive.

## Desired End State

After this plan is complete, logged-out users see a cleaner auth page with improved spacing, typography, color/focus/hover states, inline persistent auth error feedback, and simple loading labels while login/register is in progress. Auth-only side-menu actions are hidden whenever the user is not authenticated. Planner empty states on `/planners` and `/choose-planner` clearly explain what is missing and guide the user toward creating a planner where appropriate.

The implementation remains frontend-only. Existing auth calls, route guards, planner ownership, AI proposal flow, planner persistence, and dynamic week switching continue to behave as before.

### Key Discoveries:

- Auth form submission state is currently limited to `isSubmitting` and snackbar feedback in `frontend/src/app/views/auth/auth.component.ts:31`.
- The auth template hardcodes visible labels and only disables the submit button during submission in `frontend/src/app/views/auth/auth.component.html:39`.
- Auth styling is intentionally minimal in `frontend/src/app/views/auth/auth.component.scss:1`.
- Side-menu auth-only actions are always rendered in `frontend/src/app/shared/components/side-menu/side-menu.component.html:29`.
- `AuthService` already exposes `authState`, `isAuthenticated()`, and `logout()` in `frontend/src/app/core/auth/auth.service.ts:31`, so the side-menu can derive visibility without new backend or business logic.
- Planner empty-state markup currently appears in `frontend/src/app/views/planners-dashboard/planners-dashboard.component.html:17`.
- Task planner chooser empty-state markup currently appears in `frontend/src/app/views/task-planner-chooser/task-planner-chooser.component.html:16`.
- The prior P-01 smoke notes record auth UI roughness as accepted out of scope in `context/changes/minimal-account-owned-planner/manual-smoke.md`.

## What We're NOT Doing

- No backend changes.
- No auth API contract changes.
- No auth business logic changes, token lifecycle changes, refresh-token behavior, expired-token redirect behavior, password reset, email verification, or production auth hardening.
- No ownership or authorization changes.
- No AI proposal, AI acceptance, or AI dismissal changes.
- No planner persistence, task/duty persistence, edit/delete, or data model changes.
- No board architecture changes.
- No board "no duties this week" empty state in this slice.
- No dynamic week switching changes.
- No broad side-menu or app-shell redesign.
- No split/hero auth-page redesign.
- No new E2E framework setup.

## Implementation Approach

Make isolated Angular component/template/style/test changes. Reuse existing services and patterns: `AuthService` remains the source for authentication state, existing snackbar feedback stays in place, and existing translation files hold user-facing copy. Prefer light SCSS improvements over layout redesigns. Planner empty-state improvements should be local to the two planner surfaces already showing no-planner messages.

## Phase 1: Auth Form UX Polish

### Overview

Improve the existing login/register page with a light styling pass, persistent inline error feedback, and simple loading behavior that disables duplicate submissions and mode switching.

### Changes Required:

#### 1. Auth Component State

**File**: `frontend/src/app/views/auth/auth.component.ts`

**Intent**: Track persistent inline auth errors and prevent duplicate submit behavior while an auth request is in progress.

**Contract**: Keep the existing `login` and `register` service calls. Add local UI state for the last auth error message key. Clear the inline error when the user submits again or switches mode. Return early from `submit()` if `isSubmitting()` is already true. Continue showing the existing snackbar on invalid form and auth request failure.

#### 2. Auth Template

**File**: `frontend/src/app/views/auth/auth.component.html`

**Intent**: Surface auth state directly in the form so feedback remains visible after the snackbar disappears.

**Contract**: Add inline form-level error markup rendered only when an auth request fails. Disable the login/register mode buttons while submitting. Keep the submit button disabled while submitting and change its label to a loading message, with separate login/register copy. Use translation keys instead of adding more hardcoded auth strings where practical.

#### 3. Auth Styles

**File**: `frontend/src/app/views/auth/auth.component.scss`

**Intent**: Apply a light visual polish pass without a large redesign.

**Contract**: Improve spacing, typography, card/background treatment, button hover/focus/disabled states, input focus states, and responsive behavior. Do not convert the page into a split/hero layout. Keep styling local to the auth component unless a small shared variable already exists.

#### 4. Auth Translations

**Files**:

- `frontend/src/assets/i18n/en-GB.json`
- `frontend/src/assets/i18n/pl-PL.json`

**Intent**: Provide localized labels and feedback for the polished auth form.

**Contract**: Add or refine auth keys for login/register labels, loading labels, email/password labels, and inline auth error text. Preserve the existing `auth.error` key or migrate usages consistently if a clearer key structure is introduced.

#### 5. Auth Component Tests

**File**: `frontend/src/app/views/auth/auth.component.spec.ts`

**Intent**: Lock in the new auth loading/error behavior.

**Contract**: Cover duplicate-submit prevention, mode button disabling during submit, submit label changing during submit, inline error state on failed login/register, error clearing on retry or mode switch, and continued snackbar use for auth failures.

### Success Criteria:

#### Automated Verification:

- Auth component tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/auth/auth.component.spec.ts'`
- Frontend tests pass if practical: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
- Frontend build passes: `cd frontend && npm run build`

#### Manual Verification:

- Login page looks visibly cleaner while remaining a light styling pass, not a split/hero redesign.
- Invalid login/register shows persistent inline feedback and also triggers snackbar feedback.
- While submitting, the submit button and mode buttons are disabled, duplicate submit is prevented, and the submit label changes.
- Switching between login/register clears stale inline auth errors.
- Successful login/register still navigates to `/planners`.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets; the corresponding checkboxes live in the `## Progress` section.

---

## Phase 2: Authenticated Action Visibility

### Overview

Hide side-menu actions that only make sense for authenticated users when the user is logged out, without redesigning the side menu or changing route behavior.

### Changes Required:

#### 1. Side Menu Authentication State

**File**: `frontend/src/app/shared/components/side-menu/side-menu.component.ts`

**Intent**: Expose a template-readable auth state for conditional rendering.

**Contract**: Derive action visibility from the existing `AuthService` state or `isAuthenticated()` behavior. Do not introduce new auth business rules. Keep the existing `logout()` behavior unchanged for authenticated users.

#### 2. Side Menu Template

**File**: `frontend/src/app/shared/components/side-menu/side-menu.component.html`

**Intent**: Prevent logged-out users from seeing or clicking authenticated-only actions.

**Contract**: Hide create task, add planner, and logout actions when the user is not authenticated. Keep non-action navigation markup otherwise unchanged. Do not redesign the whole side menu.

#### 3. Side Menu Tests

**File**: `frontend/src/app/shared/components/side-menu/side-menu.component.spec.ts`

**Intent**: Prove logged-out and logged-in visibility behavior.

**Contract**: Add or update tests so unauthenticated state does not render create task, add planner, or logout actions, and authenticated state does render them. Preserve the existing test that logout clears planner/duty stores and routes to `/auth`.

### Success Criteria:

#### Automated Verification:

- Side menu component tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared/components/side-menu/side-menu.component.spec.ts'`
- Frontend tests pass if practical: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
- Frontend build passes: `cd frontend && npm run build`

#### Manual Verification:

- On `/auth` with no valid auth state, create task, add planner, and logout actions are not visible.
- After login, create task, add planner, and logout actions are visible.
- Logout still clears visible planner/duty state and routes to `/auth`.
- No unrelated side-menu layout redesign is introduced.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Planner Empty States

### Overview

Improve the no-planner empty states on `/planners` and `/choose-planner` only. Do not add board duty empty states or touch dynamic week switching.

### Changes Required:

#### 1. Planners Dashboard Empty State

**Files**:

- `frontend/src/app/views/planners-dashboard/planners-dashboard.component.html`
- `frontend/src/app/views/planners-dashboard/planners-dashboard.component.scss`
- `frontend/src/app/views/planners-dashboard/planners-dashboard.component.ts`

**Intent**: Make the `/planners` empty state clearer and more actionable.

**Contract**: Replace or enhance the current single text block with clearer title/body copy and a create-planner action or guidance that uses the existing `directToPlannerCreator()` path. Preserve planner card rendering when planners exist. Do not change planner loading, resolver, store, or data behavior.

#### 2. Task Planner Chooser Empty State

**Files**:

- `frontend/src/app/views/task-planner-chooser/task-planner-chooser.component.html`
- `frontend/src/app/views/task-planner-chooser/task-planner-chooser.component.scss`
- `frontend/src/app/views/task-planner-chooser/task-planner-chooser.component.ts`

**Intent**: Make the `/choose-planner` empty state explain why a planner is required before adding a task.

**Contract**: Replace or enhance the current single text block with clearer title/body copy and a create-planner action or guidance. If adding a CTA, route through the existing planner creation path rather than introducing new navigation behavior. Preserve planner selection behavior when planners exist.

#### 3. Empty-State Translations

**Files**:

- `frontend/src/assets/i18n/en-GB.json`
- `frontend/src/assets/i18n/pl-PL.json`

**Intent**: Localize the improved empty-state copy.

**Contract**: Add distinct translation keys for the dashboard empty state and task planner chooser empty state. Avoid relying on one generic `global-messages.no-planners` string where different screens need different guidance.

#### 4. Planner Empty-State Tests

**Files**:

- `frontend/src/app/views/planners-dashboard/planners-dashboard.component.spec.ts`
- `frontend/src/app/views/task-planner-chooser/task-planner-chooser.component.spec.ts`

**Intent**: Preserve empty-state visibility and CTA behavior.

**Contract**: Update tests to assert the improved empty-state container appears when planner list is empty, does not appear when planners exist, and triggers the intended planner creation navigation if a CTA is added.

### Success Criteria:

#### Automated Verification:

- Planners dashboard tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/planners-dashboard/planners-dashboard.component.spec.ts'`
- Task planner chooser tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/task-planner-chooser/task-planner-chooser.component.spec.ts'`
- Frontend tests pass if practical: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
- Frontend build passes: `cd frontend && npm run build`

#### Manual Verification:

- `/planners` with no planners shows clear copy and a next action for creating a planner.
- `/choose-planner` with no planners explains that a planner is needed before adding a task.
- Planner cards still render correctly when planners exist.
- Planner selection in `/choose-planner` still works when planners exist.
- No planner board or week-switching behavior is changed.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 4: Verification and Smoke Documentation

### Overview

Finalize verification and document the manual smoke path for P-07. This phase is verification/documentation only, not an implementation refactor phase.

### Changes Required:

#### 1. Manual Smoke Checklist

**File**: `context/changes/frontend-ux-ui-polish/manual-smoke.md`

**Intent**: Capture the human-verifiable UX checks for this slice.

**Contract**: Document preconditions, auth-page checks, logged-out side-menu checks, logged-in side-menu checks, planner empty-state checks, and explicit non-regression checks for planner board/week switching. Do not write to `context/archive/`.

#### 2. Final Verification Notes

**File**: `context/changes/frontend-ux-ui-polish/plan.md`

**Intent**: Record which automated/manual checks were run by marking the `## Progress` checklist during implementation.

**Contract**: Update only progress checkboxes and append commit hashes when implementation lands. Do not rewrite implementation scope in this phase unless the user explicitly requests a plan revision.

### Success Criteria:

#### Automated Verification:

- Auth component tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/auth/auth.component.spec.ts'`
- Side menu component tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared/components/side-menu/side-menu.component.spec.ts'`
- Planners dashboard tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/planners-dashboard/planners-dashboard.component.spec.ts'`
- Task planner chooser tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/task-planner-chooser/task-planner-chooser.component.spec.ts'`
- Frontend tests pass if practical: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
- Frontend build passes: `cd frontend && npm run build`

#### Manual Verification:

- Manual smoke checklist exists at `context/changes/frontend-ux-ui-polish/manual-smoke.md`.
- Smoke checklist confirms auth loading/error UX, logged-out action visibility, logged-in action visibility, and planner empty states.
- Smoke checklist explicitly confirms no intended backend, business logic, AI, board, or week-switching changes.

**Implementation Note**: This phase should not introduce additional runtime feature scope. It is complete when verification has been run or documented as blocked, and the smoke checklist captures the user-visible acceptance path.

---

## Testing Strategy

### Unit Tests:

- `AuthComponent`: inline error, snackbar preservation, duplicate submit prevention, disabled controls during submit, loading labels, mode-switch error clearing.
- `SideMenuComponent`: authenticated-only action visibility for authenticated and unauthenticated states, existing logout behavior preserved.
- `PlannersDashboardComponent`: empty state appears only with no planners, create-planner action still routes correctly.
- `TaskPlannerChooserComponent`: empty state appears only with no planners, planner selection remains intact when planners exist, create-planner action routes correctly if added.

### Integration Tests:

- No new E2E framework or backend integration tests are planned for this frontend-only slice.
- Existing Angular component tests and manual smoke checks provide the intended coverage.

### Manual Testing Steps:

1. Clear browser storage and open `/auth`.
2. Verify auth-only side-menu actions are hidden while logged out.
3. Submit invalid or failing auth credentials and verify inline plus snackbar feedback.
4. Verify submit and mode-switch controls are disabled during submission and duplicate submit is blocked.
5. Log in or register successfully and verify navigation to `/planners`.
6. Verify auth-only side-menu actions are visible after login.
7. With no planners, verify `/planners` empty state copy and create-planner guidance.
8. With no planners, verify `/choose-planner` empty state explains that a planner is required.
9. Create or use a planner and verify planner cards render instead of empty states.
10. Open an existing planner and verify board/week switching still behaves as before.

## Performance Considerations

No meaningful performance impact is expected. The slice adds small template/style changes and local component UI state. Avoid adding timers, global listeners, large dependencies, or heavyweight UI overlays.

## Migration Notes

No database, API, generated-client, backend, or data migration work is required.

## References

- Roadmap slice: `context/foundation/roadmap.md`
- PRD UX feedback constraint: `context/foundation/prd.md`
- P-01 smoke follow-up: `context/changes/minimal-account-owned-planner/manual-smoke.md`
- Auth component: `frontend/src/app/views/auth/auth.component.ts:31`
- Auth template: `frontend/src/app/views/auth/auth.component.html:39`
- Side menu auth actions: `frontend/src/app/shared/components/side-menu/side-menu.component.html:29`
- Auth service state: `frontend/src/app/core/auth/auth.service.ts:31`
- Planners dashboard empty state: `frontend/src/app/views/planners-dashboard/planners-dashboard.component.html:17`
- Task planner chooser empty state: `frontend/src/app/views/task-planner-chooser/task-planner-chooser.component.html:16`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Auth Form UX Polish

#### Automated

- [x] 1.1 Auth component tests pass
- [x] 1.2 Frontend tests pass if practical
- [x] 1.3 Frontend build passes

#### Manual

- [ ] 1.4 Login page looks visibly cleaner while remaining a light styling pass
- [ ] 1.5 Invalid login/register shows persistent inline feedback and snackbar feedback
- [ ] 1.6 Submitting disables controls, changes the submit label, and prevents duplicate submit
- [ ] 1.7 Switching between login/register clears stale inline auth errors
- [ ] 1.8 Successful login/register still navigates to `/planners`

### Phase 2: Authenticated Action Visibility

#### Automated

- [ ] 2.1 Side menu component tests pass
- [ ] 2.2 Frontend tests pass if practical
- [ ] 2.3 Frontend build passes

#### Manual

- [ ] 2.4 Logged-out `/auth` view hides create task, add planner, and logout actions
- [ ] 2.5 Logged-in view shows create task, add planner, and logout actions
- [ ] 2.6 Logout still clears planner/duty state and routes to `/auth`
- [ ] 2.7 No unrelated side-menu layout redesign is introduced

### Phase 3: Planner Empty States

#### Automated

- [ ] 3.1 Planners dashboard tests pass
- [ ] 3.2 Task planner chooser tests pass
- [ ] 3.3 Frontend tests pass if practical
- [ ] 3.4 Frontend build passes

#### Manual

- [ ] 3.5 `/planners` with no planners shows clear copy and next action
- [ ] 3.6 `/choose-planner` with no planners explains that a planner is required before adding a task
- [ ] 3.7 Planner cards still render correctly when planners exist
- [ ] 3.8 Planner selection in `/choose-planner` still works when planners exist
- [ ] 3.9 No planner board or week-switching behavior is changed

### Phase 4: Verification and Smoke Documentation

#### Automated

- [ ] 4.1 Auth component tests pass
- [ ] 4.2 Side menu component tests pass
- [ ] 4.3 Planners dashboard tests pass
- [ ] 4.4 Task planner chooser tests pass
- [ ] 4.5 Frontend tests pass if practical
- [ ] 4.6 Frontend build passes

#### Manual

- [ ] 4.7 Manual smoke checklist exists
- [ ] 4.8 Smoke checklist confirms auth loading/error UX, logged-out action visibility, logged-in action visibility, and planner empty states
- [ ] 4.9 Smoke checklist explicitly confirms no intended backend, business logic, AI, board, or week-switching changes
