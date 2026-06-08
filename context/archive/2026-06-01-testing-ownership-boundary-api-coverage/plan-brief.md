# Ownership Boundary API Coverage — Plan Brief

> Full plan: `context/changes/testing-ownership-boundary-api-coverage/plan.md`
> Research: `context/changes/testing-ownership-boundary-api-coverage/research.md`

## What & Why

Add backend integration/API coverage for the remaining ownership-boundary gaps in rollout Phase 1. The goal is to prove User B cannot access, infer, or mutate User A planner/duty data through direct duty endpoints or dependent duty behavior.

## Starting Point

The backend already has owner-scoped planner/duty logic and several ownership tests. The missing coverage is dynamic duties, constant duties, request-body `plannerId` smuggling, cross-user conflict isolation, and minimal auth rejection consistency.

## Desired End State

The backend suite proves the remaining direct and dependent duty access paths are safe. The test-plan cookbook also documents the project pattern for adding future backend ownership/API tests.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Scope | Backend-only, test-only | Phase 1 is quality coverage, not product behavior work. | User |
| Test placement | Extend existing ownership tests | Keeps scope small and matches current backend test organization. | User |
| Helper extraction | Avoid unless duplication becomes painful | Prevents a test refactor from overtaking the rollout slice. | User |
| Auth checks | Missing-token coverage plus one cheap invalid-token smoke | Confirms protected boundaries without turning this into full auth/session coverage. | User |
| Non-leak assertions | Assert status plus absence of sensitive names | Proves denial does not expose User A planner/duty data. | User |
| Cookbook | Update `test-plan.md` §6.1 | The rollout guide requires shipped phases to fill reusable patterns. | User |

## Scope

**In scope:**

- Extend `DutyOwnershipTest` for dynamic duty denial, constant duty isolation, body `plannerId` smuggling, cross-user conflict isolation, and focused auth rejection.
- Optionally extend `PlannerOwnershipTest` only for a narrow protected-endpoint auth smoke.
- Update `context/foundation/test-plan.md` §6.1 and §6.6 after tests land.

**Out of scope:**

- Product behavior changes.
- API, schema, migration, service, repository, mapper, DTO, runtime config, or frontend changes.
- New update/delete endpoints or tests for endpoints that do not exist.
- Broad auth/session coverage or e2e coverage.

## Architecture / Approach

Use the existing Spring Boot integration-test pattern: full app context, MockMvc, real registration, bearer JWTs, and H2/Flyway-backed schema. Assertions should be API-level and behavior-focused, especially status plus absence of sensitive User A names for cross-user denial.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Extend Backend Ownership API Tests | Adds the missing backend integration/API ownership cases. | Accidentally duplicating happy paths or mirroring production query logic. |
| 2. Update Backend Ownership Testing Cookbook | Records the reusable pattern in `test-plan.md` §6.1. | Writing a one-off log instead of a useful cookbook entry. |

**Prerequisites:** Java 22 available for backend tests; existing backend test suite baseline passes outside the sandbox.
**Estimated effort:** ~1 focused implementation session across 2 phases.

## Open Risks & Assumptions

- Mockito/Byte Buddy attachment may fail inside the sandbox; backend verification may need the already-approved outside-sandbox Maven test path.
- Invalid-token smoke stays minimal. Full expired/stale session behavior belongs to later auth/session coverage.
- Update/delete ownership remains untested until those endpoints exist.

## Success Criteria (Summary)

- Cross-user dynamic and constant duty endpoints do not expose another user's duty data.
- Body-level `plannerId` cannot redirect duty creation away from the owned path planner.
- `context/foundation/test-plan.md` §6.1 becomes the reusable backend ownership/API testing cookbook entry.
