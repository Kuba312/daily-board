# Ownership Boundary API Coverage Implementation Plan

## Overview

Extend backend integration/API tests for rollout Phase 1 of the quality plan. The work locks down the missing planner/duty ownership access paths from risks #1 and #5 without changing product behavior, API shape, schema, runtime code, or frontend code.

## Current State Analysis

The backend already enforces the primary ownership boundary through authenticated-user service calls. Planner create/list/detail paths are owner-scoped, and duty create/read paths resolve the requested planner through the current authenticated owner before touching dependent duty data.

Existing integration tests already cover planner owner assignment, per-user planner list isolation, cross-user planner detail denial, owner duty create/read, cross-user duty create denial, cross-user duty read denial, and one unauthenticated duty endpoint. The gaps are narrower: dynamic duty reads, constant duty isolation, body `plannerId` smuggling, cross-user duty conflict isolation, and minimal missing/invalid auth rejection consistency.

## Desired End State

After this plan is complete, the backend test suite proves that User B cannot learn or mutate User A planner/duty data through the remaining direct duty API paths, even when User B knows User A's planner id. The suite also records the project pattern for future backend ownership/API tests in `context/foundation/test-plan.md` §6.1.

### Key Discoveries:

- Planner and duty API namespaces are already protected by Spring Security in `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/config/SecurityConfig.java:43`.
- Duty ownership is derived through `Duty.planner.owner`, not a direct duty owner field, so dependent duty paths are the important Phase 1 surface.
- `GET /api/v1/duties/dynamic/{plannerId}` and `GET /api/v1/duties/constant` have ownership logic but no explicit cross-user API tests yet.
- Duty creation currently makes the path planner authoritative by attaching saved duties to the resolved planner in `DutyService`.
- There are no planner/duty update or delete endpoints today, so update/delete ownership coverage is explicitly not applicable in this phase.
- Backend tests use full Spring + MockMvc integration style and real register/login tokens instead of mocked security principals.

## What We're NOT Doing

- No product behavior changes.
- No API, schema, migration, security config, service, repository, mapper, DTO, or frontend changes.
- No new update/delete endpoints and no tests for endpoints that do not exist.
- No broad auth/session test suite.
- No e2e tests.
- No duplication of happy-path ownership tests already covered.
- No shared test helper extraction unless implementation proves the local duplication is genuinely painful.

## Implementation Approach

Extend the existing backend ownership test classes rather than creating a new broad test class. `DutyOwnershipTest` should receive most of the new cases because the uncovered risk is dependent duty access. `PlannerOwnershipTest` should only receive a small missing-auth or invalid-token check if it fits naturally and does not duplicate existing planner ownership coverage.

The assertions should be behavior-level: use public API setup where practical, assert expected HTTP statuses, assert sensitive User A planner/duty names are absent from cross-user responses where a body exists, and avoid copying production repository/query logic into assertions.

## Phase 1: Extend Backend Ownership API Tests

### Overview

Add the missing backend integration/API tests for dynamic duties, constant duties, body planner-id smuggling, cross-user duty conflict isolation, and minimal protected-endpoint auth rejection.

### Changes Required:

#### 1. Duty Ownership Test Coverage

**File**: `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java`

**Intent**: Extend the existing duty ownership integration tests to cover the dependent duty paths that are not currently proved by the suite.

**Contract**: Add tests that:

- Return `404` for User B calling `GET /api/v1/duties/dynamic/{userAPlannerId}?from=...&to=...`.
- Assert the cross-user dynamic-duty response does not contain User A duty names where response content is present.
- Prove `GET /api/v1/duties/constant` returns only the authenticated user's constant duties when User A and User B both have constant duties.
- Prove `POST /api/v1/duties/{ownedPlannerId}` ignores or overrides a conflicting body-level `plannerId` and associates the saved duty with the path planner owned by the caller.
- Prove overlapping duties in different users' planners do not conflict across owners.
- Add missing-token rejection for the new duty paths covered here.
- Add one invalid-token smoke for a protected duty endpoint if it is cheap and does not require new auth infrastructure.

#### 2. Planner Ownership Test Coverage

**File**: `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/PlannerOwnershipTest.java`

**Intent**: Keep planner-side additions minimal and avoid duplicating already-covered planner ownership behavior.

**Contract**: Add only a narrowly scoped missing-token or invalid-token protected planner check if it complements the duty auth smoke. Do not re-test planner list isolation, owner assignment, or cross-user detail denial beyond the current tests.

#### 3. Test Fixture Shape

**Files**:

- `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java`
- `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/PlannerOwnershipTest.java`

**Intent**: Keep test setup consistent with the existing backend suite while avoiding a speculative helper refactor.

**Contract**: Continue using MockMvc, real `/api/v1/auth/register` calls, parsed bearer tokens, and public planner/duty endpoints for setup. Keep helper methods local to the current classes unless implementation reveals enough repeated setup to justify a small package-private test support class.

### Success Criteria:

#### Automated Verification:

- `DutyOwnershipTest` covers cross-user dynamic duty access denial with no User A duty-name leakage.
- `DutyOwnershipTest` covers constant-duty isolation across two users.
- `DutyOwnershipTest` covers body `plannerId` smuggling during duty create.
- `DutyOwnershipTest` covers cross-user duty conflict isolation.
- Protected endpoint auth rejection has missing-token coverage for the newly tested duty paths and one cheap invalid-token smoke.
- Backend tests pass with Java 22: `cd backend/dailyboard-backend && JAVA_HOME=$(/usr/libexec/java_home -v 22) ./mvnw test`.

#### Manual Verification:

- Review the new tests and confirm they assert product behavior rather than mirroring repository/query implementation.
- Confirm no production code, frontend code, API contract, schema, or runtime configuration changed.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase. Phase blocks use plain bullets; the corresponding `- [ ]` checkboxes live in the `## Progress` section at the bottom of the plan.

---

## Phase 2: Update Backend Ownership Testing Cookbook

### Overview

Record the backend ownership/API testing pattern in the test-plan cookbook so future rollout phases and contributors reuse the right style.

### Changes Required:

#### 1. Backend Ownership Cookbook Entry

**File**: `context/foundation/test-plan.md`

**Intent**: Replace the §6.1 placeholder with the concrete pattern that Phase 1 established.

**Contract**: Update `### 6.1 Adding backend ownership/API coverage` with:

- Test location and naming guidance for backend ownership/API tests.
- Fixture pattern: full Spring + MockMvc, real registration, bearer token requests, H2/Flyway-backed test DB.
- Assertion pattern: use public API setup, assert status and absence of sensitive names for cross-user denial, avoid copying production query logic.
- Run command for the backend gate with Java 22.
- Reference tests added in Phase 1.

#### 2. Per-Rollout-Phase Note

**File**: `context/foundation/test-plan.md`

**Intent**: Leave a short §6.6 note that Phase 1 shipped backend ownership/API coverage patterns.

**Contract**: Add a concise note under `### 6.6 Per-rollout-phase notes` naming the Phase 1 change folder and the backend command used for verification.

### Success Criteria:

#### Automated Verification:

- `context/foundation/test-plan.md` §6.1 no longer says `TBD`.
- `context/foundation/test-plan.md` §6.1 names the backend ownership/API test location, reference tests, assertion pattern, and run command.
- `context/foundation/test-plan.md` §6.6 includes a concise Phase 1 note.
- Backend tests still pass with Java 22 after the documentation update: `cd backend/dailyboard-backend && JAVA_HOME=$(/usr/libexec/java_home -v 22) ./mvnw test`.

#### Manual Verification:

- Review §6.1 and confirm it reads like a reusable project cookbook entry, not a one-off implementation log.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before marking the change complete.

---

## Testing Strategy

### Unit Tests:

- No unit tests are planned. This phase targets backend integration/API behavior because the risk is endpoint-level ownership exposure.

### Integration Tests:

- Extend `DutyOwnershipTest` for dynamic-duty cross-user denial, constant-duty isolation, body `plannerId` smuggling, cross-user conflict isolation, and minimal auth rejection.
- Extend `PlannerOwnershipTest` only for a narrow protected-endpoint auth check if it adds signal without duplicating existing planner ownership tests.

### Manual Testing Steps:

1. Review the test diff and confirm only backend test files and `context/foundation/test-plan.md` changed.
2. Confirm the tests set up users through public auth/planner/duty APIs where practical.
3. Confirm cross-user denial tests check both expected status and no sensitive User A names in response bodies where content exists.
4. Confirm update/delete paths are documented as not applicable because the backend has no such endpoints today.

## Performance Considerations

The added tests run inside the existing Spring Boot integration suite and will create several users, planners, and duties in H2. Keep scenarios compact so the backend gate remains reasonable for local agent loops.

## Migration Notes

No database migrations, schema changes, or data migrations are part of this plan.

## References

- Related research: `context/changes/testing-ownership-boundary-api-coverage/research.md`
- Quality contract: `context/foundation/test-plan.md`
- Existing duty tests: `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java`
- Existing planner tests: `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/PlannerOwnershipTest.java`
- Duty service ownership guard: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:29`
- Planner service ownership guard: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:30`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Extend Backend Ownership API Tests

#### Automated

- [x] 1.1 `DutyOwnershipTest` covers cross-user dynamic duty access denial with no User A duty-name leakage — ddb5cce
- [x] 1.2 `DutyOwnershipTest` covers constant-duty isolation across two users — ddb5cce
- [x] 1.3 `DutyOwnershipTest` covers body `plannerId` smuggling during duty create — ddb5cce
- [x] 1.4 `DutyOwnershipTest` covers cross-user duty conflict isolation — ddb5cce
- [x] 1.5 Protected endpoint auth rejection has missing-token coverage for the newly tested duty paths and one cheap invalid-token smoke — ddb5cce
- [x] 1.6 Backend tests pass with Java 22 — ddb5cce

#### Manual

- [x] 1.7 Review the new tests and confirm they assert product behavior rather than mirroring repository/query implementation — ddb5cce
- [x] 1.8 Confirm no production code, frontend code, API contract, schema, or runtime configuration changed — ddb5cce

### Phase 2: Update Backend Ownership Testing Cookbook

#### Automated

- [ ] 2.1 `context/foundation/test-plan.md` §6.1 no longer says `TBD`
- [ ] 2.2 `context/foundation/test-plan.md` §6.1 names the backend ownership/API test location, reference tests, assertion pattern, and run command
- [ ] 2.3 `context/foundation/test-plan.md` §6.6 includes a concise Phase 1 note
- [ ] 2.4 Backend tests still pass with Java 22 after the documentation update

#### Manual

- [ ] 2.5 Review §6.1 and confirm it reads like a reusable project cookbook entry, not a one-off implementation log
