---
project: "Daily Board"
version: 1
status: draft
created: 2026-05-25
updated: 2026-07-11
prd_version: 1
main_goal: speed
top_blocker: time
---

# Roadmap: Daily Board

> Derived from `context/foundation/prd.md` (v1) and the current codebase baseline.
> Vertical-first MVP roadmap for solo after-hours work: every main slice should be testable end-to-end.

## Vision Recap

Daily Board already has planners, duties, board/calendar views, and dynamic week switching. The MVP work is to add user accounts, ownership, and owned CRUD for planning data without breaking the current board behavior. AI-assisted weekly planning is a future enhancement; if revisited, AI must first show a proposal preview and planner data must change only after explicit user acceptance.

## Practical Assumptions

- Existing data is development/test data; no production migration is required.
- MVP usage is single-user/dev usage with small data volume.
- No production deploy, scale work, `qps` sizing, or performance optimization is planned now.
- Existing board/calendar behavior and dynamic week switching are protected behavior.

## At A Glance

| ID | Change ID | Outcome | Prerequisites | PRD refs | Status |
|---|---|---|---|---|---|
| P-01 | minimal-account-owned-planner | User can register/login/logout, create own planner, and prove another user cannot see it | — | US-01, FR-001, FR-002, FR-003, FR-004, FR-005, FR-011, FR-017 | done |
| P-02 | owned-manual-planning-board | User can add task/event/duty to own planner; board/calendar shows only scoped data with week switching preserved | P-01 | US-01, FR-008, FR-011, FR-012, FR-013, FR-017 | done |
| P-03 | owned-planning-crud-minimum | User can update/delete owned planners and duties, with planner-delete confirmation and ownership isolation | P-02 | US-01, FR-006, FR-007, FR-009, FR-010, FR-011, FR-017 | done |
| P-04 | frontend-ux-ui-polish | User sees clearer auth, navigation, loading/error, and empty states without changing business behavior | P-01, P-02, P-03 | US-01, NFR-01 | proposed |
| P-05 | local-dev-config-baseline | Local/dev config is tidy enough for local smoke checks; not blocking the product flow | — | NFR-04 | optional/later |
| P-06 | ai-weekly-proposal-preview | Future enhancement: user can enter weekly intent, see an AI proposal, and no database write happens before accept | P-03 | US-01, FR-014, FR-016 | optional/later |
| P-07 | accept-ai-proposal-to-board | Future enhancement: user can accept an AI proposal and see accepted items saved to their owned planner on board/calendar | P-06 | US-01, FR-015, FR-011, FR-012, FR-013, FR-017 | optional/later |

## Implementation Guardrails

- Keep changes small and scoped to the current roadmap item.
- Avoid drive-by refactors.
- Do not rewrite board architecture.
- Do not touch dynamic week switching unless the current item requires it.
- Keep auth/ownership mostly in backend, API/facade, and store/data-loading layers; board components should consume already-scoped data.
- No roles, no advanced permissions, no refresh-token flow unless required by the selected auth approach.
- P-01 includes minimal auth UI only; do not polish auth UX or expand into production auth hardening there. Frontend UX/UI polish belongs in P-07.

## Dependency Chain

### P-01: Minimal Account-Owned Planner Vertical Slice

- **Outcome:** user can register, login, logout, create their own planner, and another user cannot see that planner.
- **Change ID:** minimal-account-owned-planner
- **Prerequisites:** —
- **PRD refs:** US-01, FR-001, FR-002, FR-003, FR-004, FR-005, FR-011, FR-017
- **Scope:** minimal UI, frontend minimal auth state, backend `User` entity, password hashing, token/session issuing, planner owner relation, protected planner endpoints.
- **Out of scope:** polished auth UX, roles, advanced permissions, refresh-token flow unless required, production deploy, AI, board rewrite, edit/delete.
- **Verification:** create User A; create planner as User A; logout; create/login User B; verify User B cannot see User A planner; login User A again; verify User A sees own planner.
- **Status:** done

### P-02: Owned Manual Planning Board

- **Outcome:** user can add task/event/duty to their own planner; board/calendar shows only scoped data; dynamic week switching remains preserved.
- **Change ID:** owned-manual-planning-board
- **Prerequisites:** P-01
- **PRD refs:** US-01, FR-008, FR-011, FR-012, FR-013, FR-017
- **Notes:** Scope data before it reaches the board; avoid board auth logic and preserve existing week switching behavior.
- **Status:** done

### P-03: Owned Planning CRUD Minimum

- **Outcome:** user can update and delete their own planners and duties; planner delete has confirmation; another user cannot update/delete that data.
- **Change ID:** owned-planning-crud-minimum
- **Prerequisites:** P-02
- **PRD refs:** US-01, FR-006, FR-007, FR-009, FR-010, FR-011, FR-017
- **Scope:** edit planner basics, delete planner with confirmation, edit duty/task/event, delete duty/task/event, backend ownership checks on update/delete, frontend state refresh after mutation.
- **Out of scope:** AI proposal flow, shared planners, advanced bulk edit, recurring rules, visual polish beyond required controls.
- **Notes:** Required for graduation/project completeness and should be the next required slice after P-02.
- **Status:** done

### P-04: Frontend UX/UI Polish

- **Outcome:** user sees a more polished login page, correct logout visibility, clearer auth form loading/error states, and clearer empty states where applicable.
- **Change ID:** frontend-ux-ui-polish
- **Prerequisites:** P-01, P-02, P-03
- **PRD refs:** US-01, NFR-01
- **Scope:** frontend-only user experience improvements for auth and empty-state surfaces: visual login-page polish, hide/disable logout when unauthenticated, improved loading and error feedback on authentication forms, and clearer empty states for screens with no user data.
- **Out of scope:** backend changes, auth/business-logic changes, ownership rules, AI proposal behavior, planner persistence behavior, board/week switching behavior, production auth hardening.
- **Verification:** logged-out user does not see an active logout action; auth forms show clear loading and error feedback; login page visual treatment is improved; relevant empty states explain what is missing and the next user action; existing planner/board/week switching behavior remains unchanged.
- **Status:** proposed

### P-05: Local/Dev Config Baseline

- **Outcome:** backend local profile/config is tidy, frontend has controlled `apiBaseUrl`, and the local MVP flow can be smoke-checked.
- **Change ID:** local-dev-config-baseline
- **Prerequisites:** —
- **PRD refs:** NFR-04
- **Notes:** Optional/later only. This is local/dev hygiene, not production deploy readiness and not a blocker for P-01–P-05.
- **Status:** optional/later

### P-06: AI Weekly Proposal Preview

- **Outcome:** future enhancement where user enters weekly intent, AI returns a proposal, and no database write happens before explicit accept.
- **Change ID:** ai-weekly-proposal-preview
- **Prerequisites:** P-03
- **PRD refs:** US-01, FR-014, FR-016
- **Notes:** Optional for graduation. Revisit only after owned CRUD and core MVP requirements are complete; OpenRouter/AI introduces cost and implementation overhead.
- **Status:** optional/later

### P-07: Accept AI Proposal To Board

- **Outcome:** future enhancement where accepted proposal saves items to the user's owned planner, and board/calendar shows the saved items.
- **Change ID:** accept-ai-proposal-to-board
- **Prerequisites:** P-06
- **PRD refs:** US-01, FR-015, FR-011, FR-012, FR-013, FR-017
- **Notes:** Optional continuation of the AI preview slice. Keep the explicit-accept safety rule if this is revisited after CRUD and core MVP requirements.
- **Status:** optional/later

## Backlog Handoff

| Roadmap ID | Change ID | Suggested issue title | Ready for `/10x-plan` | Notes |
|---|---|---|---|---|
| P-01 | minimal-account-owned-planner | Minimal account-owned planner vertical slice | yes | Start here; first end-to-end testable slice |
| P-02 | owned-manual-planning-board | Owned manual planning board | no | Wait for P-01 |
| P-03 | owned-planning-crud-minimum | Owned planning CRUD minimum | yes | Next required graduation slice after P-02 |
| P-04 | frontend-ux-ui-polish | Frontend UX/UI polish for auth and empty states | no | Wait for required CRUD unless polish becomes a presentation blocker |
| P-05 | local-dev-config-baseline | Local/dev config baseline | optional/later | Not blocking core CRUD MVP |
| P-06 | ai-weekly-proposal-preview | AI weekly proposal preview without persistence | optional/later | Future enhancement after CRUD/core MVP; optional for graduation |
| P-07 | accept-ai-proposal-to-board | Accept AI proposal to board | optional/later | Future enhancement after AI preview |

## Parked

- **Production deploy readiness** — Why parked: no real deploy or infra spend is planned for this MVP phase.
- **Production scale, `qps`, and `data_volume` sizing** — Why parked: assume single-user/dev usage and small data volume for now.
- **Advanced smoke/performance checks** — Why parked: local manual smoke check is enough until production deploy becomes a real goal.
- **Shared planners** — Why parked: MVP focuses on single-user ownership.
- **Advanced roles and permissions** — Why parked: one user role is enough for MVP.
- **Google Calendar integration** — Why parked: validate planning inside Daily Board first.
- **Mobile app** — Why parked: desktop board/calendar is the primary workspace.
- **Push notifications** — Why parked: board visibility matters more than reminder infrastructure now.
- **Advanced productivity analytics** — Why parked: MVP focuses on planning and editing, not retrospective measurement.
- **Payments** — Why parked: monetization is outside this change.
- **File import** — Why parked: MVP assumes planning starts directly inside the app.
- **Advanced planning algorithm** — Why parked: AI should provide a sensible starting proposal, not a fully optimized scheduler.
- **AI/OpenRouter implementation** — Why parked: optional for graduation and adds cost plus implementation overhead; revisit after owned CRUD and core MVP requirements are complete.
- **Full project-management workflow** — Why parked: Daily Board remains a planning app.

## Done

- **P-01: user can register, login, logout, create their own planner, and another user cannot see that planner.** — Archived 2026-07-05 → `context/archive/2026-05-26-minimal-account-owned-planner/`. Lesson: —.
- **P-02: user can add task/event/duty to their own planner; board/calendar shows only scoped data; dynamic week switching remains preserved.** — Archived 2026-06-09 → `context/archive/2026-06-08-owned-manual-planning-board/`. Lesson: —.
- **P-03: user can update and delete their own planners and duties; planner delete has confirmation; another user cannot update/delete that data.** — Archived 2026-07-11 → `context/archive/2026-07-05-owned-planning-crud-minimum/`. Lesson: —.
