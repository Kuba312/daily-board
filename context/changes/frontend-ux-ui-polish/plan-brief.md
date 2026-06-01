# Frontend UX/UI Polish — Plan Brief

> Full plan: `context/changes/frontend-ux-ui-polish/plan.md`

## What & Why

This plan implements P-07 as a frontend-only UX/UI polish slice. It addresses the rough auth and empty-state experience noticed after S-01 through S-04 while preserving backend behavior, auth business logic, ownership, AI flows, and board/week switching.

## Starting Point

P-01 added a minimal auth shell and accepted UI roughness as out of scope. The current auth page is plain, auth errors are snackbar-only, side-menu auth actions always render, and planner empty states are basic text blocks.

## Desired End State

Users get a cleaner login/register page with persistent inline auth errors, existing snackbar feedback, and clear disabled/loading labels during submit. Logged-out users do not see create task, add planner, or logout actions. `/planners` and `/choose-planner` empty states explain what is missing and guide the next action.

## Key Decisions Made

| Decision | Choice | Why |
| --- | --- | --- |
| Scope | Auth + planner empty states only | Matches P-07 and avoids broad shell/chrome polish. |
| Auth errors | Inline + snackbar | Inline feedback remains visible while snackbar preserves the app's existing feedback pattern. |
| Loading behavior | Disable controls + label | Simple, clear, and avoids spinner/overlay work. |
| Logout/actions | Hide auth-only actions | Prevents invalid logged-out actions without redesigning the whole side menu. |
| Empty states | Planner surfaces only | Improves known empty states while avoiding board/week-switching risk. |
| Visual direction | Light styling pass | Improves first impression without a larger split/hero redesign. |
| Verification | Component tests + manual smoke | Covers behavior changes without adding a new E2E setup. |

## Scope

**In scope:**

- Auth page light visual polish.
- Inline auth error state plus existing snackbar feedback.
- Disabled submit/mode-switch controls and loading labels during auth submission.
- Hide create task, add planner, and logout actions while unauthenticated.
- Improve `/planners` and `/choose-planner` empty states.
- Component tests and manual smoke documentation.

**Out of scope:**

- Backend changes.
- Auth business logic, token lifecycle, expired-token redirect, or production auth hardening.
- Ownership, authorization, planner persistence, task persistence, edit/delete, or AI changes.
- Board duty empty states.
- Board architecture or dynamic week switching changes.
- Broad side-menu/app-shell redesign.
- New E2E framework setup.

## Architecture / Approach

Keep the work local to Angular components, templates, SCSS, translations, and component specs. Use `AuthService` as the existing source for auth state, keep snackbar behavior, and add only local UI state where needed for inline auth errors and submit loading.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Auth Form UX Polish | Better auth visuals, inline errors, loading labels, and auth tests | Accidentally changing auth behavior instead of only UI state |
| 2. Authenticated Action Visibility | Logged-out users no longer see auth-only side-menu actions | Broadening into side-menu redesign |
| 3. Planner Empty States | Clearer `/planners` and `/choose-planner` empty states | Touching board/no-duty behavior by mistake |
| 4. Verification and Smoke Documentation | Manual smoke checklist and final verification tracking | Letting this phase become a refactor phase |

**Prerequisites:** P-01 auth shell exists; this plan assumes the current frontend auth and planner routes remain in place.
**Estimated effort:** ~2-3 focused sessions across 4 phases.

## Open Risks & Assumptions

- Existing frontend lint may contain pre-existing generated/API lint debt; record blockers rather than expanding this slice to fix unrelated lint.
- Visual polish requires human review because component tests cannot judge whether the auth page looks materially better.
- Empty-state CTAs should use existing navigation paths and not introduce new product behavior.

## Success Criteria (Summary)

- Auth form has improved visual polish, inline plus snackbar error feedback, and clear disabled/loading behavior.
- Logged-out users cannot see create task, add planner, or logout actions; logged-in users still can.
- `/planners` and `/choose-planner` empty states are clearer, tested where practical, and no board/week-switching behavior is changed.
