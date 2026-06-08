---
date: 2026-06-01T19:13:44+02:00
researcher: Codex
git_commit: 523759151cf01e3732e5cc1f86497cda85495ac0
branch: DB-49
repository: daily-board
topic: "Ownership boundary API coverage"
tags: [research, codebase, backend, ownership, api, spring-boot]
status: complete
last_updated: 2026-06-01
last_updated_by: Codex
---

# Research: Ownership boundary API coverage

**Date**: 2026-06-01T19:13:44+02:00
**Researcher**: Codex
**Git Commit**: 523759151cf01e3732e5cc1f86497cda85495ac0
**Branch**: DB-49
**Repository**: daily-board

## Research Question

Ground rollout Phase 1 of `context/foundation/test-plan.md`: "Ownership boundary API coverage".

Risks covered:

- #1 User B can access User A planner or duty through direct endpoint/manual URL even when lists are filtered.
- #5 Ownership scoping fails on dependent planner/duty operations across create/detail/update/delete paths.

Research must ground auth/session shape, ownership checks, protected API boundaries, non-leaking error semantics, relationship rules, dependent endpoints, update/delete availability, and current backend integration/API test patterns.

## Summary

The backend already enforces the main planner and duty ownership boundary through authenticated-user service calls, not frontend filtering. Planner create assigns the current user, planner list/detail use owner-scoped repository methods, and duty create/read paths resolve the path planner through `planner.id + currentUser.id` before querying or saving duties.

Existing integration/API tests already cover planner owner assignment, per-user planner list isolation, direct cross-user planner detail denial, owner duty create/read, cross-user duty create denial, cross-user duty list denial, and one unauthenticated duty endpoint. That means Phase 1 should extend coverage around missing access paths rather than duplicate only the happy path.

Highest-signal Phase 1 additions are:

- Cross-user `GET /api/v1/duties/dynamic/{plannerId}` returns `404` and does not leak duty names.
- `GET /api/v1/duties/constant` returns only the caller's constant duties across two users.
- Duty create ignores body-level `plannerId` smuggling and attaches saved duties to the owned path planner.
- Overlapping duties in different users' planners do not conflict with each other.
- Protected planner/duty endpoints consistently reject missing or malformed bearer tokens.
- There are no update/delete endpoints today, so Phase 1 should document those paths as not applicable rather than inventing tests.

Verification baseline: `JAVA_HOME=$(/usr/libexec/java_home -v 22) ./mvnw test` passed outside the sandbox with 12 tests, 0 failures, 0 errors. The same command inside the sandbox fails because Mockito/Byte Buddy cannot self-attach; the default JDK without `JAVA_HOME` also fails because the project targets Java 22.

## Detailed Findings

### Protected API Boundary

- Planner endpoints are under `/api/v1/planners`: create, list, and detail ([PlannerController.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/PlannerController.java:23), [PlannerController.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/PlannerController.java:29), [PlannerController.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/PlannerController.java:35), [PlannerController.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/PlannerController.java:40)).
- Duty endpoints are under `/api/v1/duties`: create by planner id, dynamic range read, constant-duty read, and read by planner id ([DutyController.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/DutyController.java:26), [DutyController.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/DutyController.java:32), [DutyController.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/DutyController.java:38), [DutyController.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/DutyController.java:47), [DutyController.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/DutyController.java:52)).
- Security requires authentication for both planner and duty API namespaces while permitting auth and OpenAPI routes ([SecurityConfig.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/config/SecurityConfig.java:35), [SecurityConfig.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/config/SecurityConfig.java:43)).
- JWT auth loads the application `User` by token subject and stores that DAO as the Spring Security principal ([JwtAuthenticationFilter.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/config/JwtAuthenticationFilter.java:50), [JwtAuthenticationFilter.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/config/JwtAuthenticationFilter.java:55)).
- Services resolve the current user from `SecurityContextHolder`; missing or non-`User` principals fail as authentication errors ([AuthenticatedUserService.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/AuthenticatedUserService.java:12)).

### Planner Ownership

- Planner creation overwrites any inbound ownership concept by setting the authenticated user as owner before save ([PlannerService.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:20)).
- Planner list is scoped to `findAllByOwnerId(currentUser.id)` ([PlannerService.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:26), [PlannerRepository.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/repository/PlannerRepository.java:12)).
- Planner detail is scoped to `findByIdAndOwnerId(id, currentUser.id)` and throws `EntityNotFoundException` when the id does not belong to the current user ([PlannerService.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:30), [PlannerRepository.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/repository/PlannerRepository.java:14)).
- `EntityNotFoundException` maps to `404`, so cross-user access is non-leaking by status semantics rather than exposed as `403` ([GlobalExceptionHandler.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/exepctions/GlobalExceptionHandler.java:32)).

### Duty Ownership And Dependent Operations

- `Duty` has no independent owner; ownership is derived through its planner relation ([Duty.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/model/dao/Duty.java:34), [Planner.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/model/dao/Planner.java:30)).
- Duty create calls `getCurrentUserPlanner(plannerId)` before conflict detection and save ([DutyService.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:29)).
- Duty read by dynamic range and duty read by planner id both perform the owned-planner guard before using direct planner-id repository methods ([DutyService.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:37), [DutyService.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:43)).
- Constant duties do not accept a planner id; they filter through `planner.owner.id` in the repository method ([DutyService.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:49), [DutyRepository.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/repository/DutyRepository.java:16)).
- Save overwrites every incoming duty's planner with the resolved owned planner, making the path planner authoritative over `DutyDto.plannerId` ([DutyService.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:83), [DutyDto.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/model/dto/DutyDto.java:35)).
- Conflict detection is planner-id scoped after the ownership check has passed; tests should assert behavior with overlapping duties across two users without duplicating the specification/query implementation ([DutyService.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:56), [JpaUtils.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/JpaUtils.java:7)).

### Schema And Repository Constraints

- Initial schema creates `planner` and `duty`, with `duty.planner_id` as a foreign key to planner using `ON DELETE CASCADE` ([V1__init_tables.sql](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/resources/db/migration/V1__init_tables.sql:10)).
- Planner ownership was added later as nullable `owner_id`, indexed and foreign-keyed to `app_user(id)` ([V3__add_planner_owner.sql](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/resources/db/migration/V3__add_planner_owner.sql:1)).
- Because `planner.owner_id` and `duty.planner_id` are nullable in schema, ownership is primarily enforced by service/API flow. Phase 1 API tests should exercise public endpoints rather than asserting only repository queries or schema shape.
- There is a type mismatch worth avoiding in new tests unless needed: `Duty.id` is a `String`, while `DutyRepository` is parameterized as `JpaRepository<Duty, UUID>` ([Duty.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/model/dao/Duty.java:18), [DutyRepository.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/repository/DutyRepository.java:12)).

### Existing Backend Tests

- Backend tests use full Spring integration style with `@SpringBootTest` and `@AutoConfigureMockMvc` ([AuthControllerTest.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/AuthControllerTest.java:22), [PlannerOwnershipTest.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/PlannerOwnershipTest.java:23), [DutyOwnershipTest.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:24)).
- Tests use real registration and bearer JWTs, not mock users; helper code is duplicated across ownership tests ([PlannerOwnershipTest.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/PlannerOwnershipTest.java:89), [DutyOwnershipTest.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:96)).
- Test DB setup uses H2 in MySQL mode, migration-backed schema, and test JWT settings in `src/test/resources/application.yml` ([application.yml](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/test/resources/application.yml:1)).
- Planner ownership tests already cover authenticated owner assignment, per-user list isolation, and cross-user planner detail `404` ([PlannerOwnershipTest.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/PlannerOwnershipTest.java:45), [PlannerOwnershipTest.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/PlannerOwnershipTest.java:58), [PlannerOwnershipTest.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/PlannerOwnershipTest.java:78)).
- Duty ownership tests already cover owner create/read, cross-user create blocked, cross-user read blocked, and one unauthenticated duty endpoint ([DutyOwnershipTest.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:50), [DutyOwnershipTest.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:67), [DutyOwnershipTest.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:77), [DutyOwnershipTest.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:90)).
- There is no shared backend test fixture yet. A small package-private helper could reduce duplication, but Phase 1 can stay scoped by adding cases to the existing test classes if only a few scenarios are needed.

### Coverage Gaps

- Dynamic duty read has an ownership guard in code but no explicit cross-user test: `GET /api/v1/duties/dynamic/{plannerId}?from=...&to=...` ([DutyController.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/DutyController.java:38)).
- Constant duties have an owner-scoped query but no API test proving cross-user filtering or unauthenticated rejection: `GET /api/v1/duties/constant` ([DutyController.java](/Applications/portfolio-apps/daily-board/backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/DutyController.java:47)).
- Protected endpoint unauthorized coverage is incomplete: current tests cover `/api/v1/planners/all` and `/api/v1/duties/{plannerId}`, but not planner create/detail, duty create, duty dynamic, or duty constant.
- Malformed/invalid bearer token behavior is not covered for protected planner/duty endpoints.
- Body `plannerId` smuggling during duty create is not covered. Current service behavior should save under the path planner after resolving ownership.
- Cross-user duty conflict isolation is not covered. Overlapping duties in User A and User B planners should not produce conflict errors across owners.
- No `@PutMapping`, `@PatchMapping`, or `@DeleteMapping` exists in backend planner/duty controllers today, so update/delete ownership paths are not currently testable through the API.

## Code References

- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/config/SecurityConfig.java:35` - Unauthorized entry point and protected planner/duty API matchers.
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/config/JwtAuthenticationFilter.java:50` - JWT subject is resolved to an application `User`.
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/AuthenticatedUserService.java:12` - Service-level current user lookup.
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:20` - Planner owner assignment on create.
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:26` - Owner-scoped planner list.
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:30` - Owner-scoped planner detail.
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:29` - Owned planner guard before duty create.
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:37` - Owned planner guard before dynamic duty read.
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:43` - Owned planner guard before planner-duty read.
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:49` - Constant duties scoped by current owner.
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:83` - Incoming duties are attached to resolved path planner.
- `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/PlannerOwnershipTest.java:58` - Existing per-user planner list test.
- `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/PlannerOwnershipTest.java:78` - Existing cross-user planner detail test.
- `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:67` - Existing cross-user duty create test.
- `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java:77` - Existing cross-user duty list test.

## Architecture Insights

- The backend ownership boundary is layered: Spring Security authenticates the namespace, `JwtAuthenticationFilter` resolves the application user, and services perform ownership checks before repository access. Tests should exercise all three layers through MockMvc and real JWTs.
- Planner ownership is explicit (`Planner.owner`); duty ownership is derived (`Duty.planner.owner`). Phase 1 should challenge the derived-ownership assumption with dependent duty endpoints, especially constant and dynamic reads.
- Cross-user denial currently uses non-leaking `404` for owner-scoped lookup misses. Assertions should preserve that contract and check sensitive names do not appear in response bodies.
- The API has no update/delete planner or duty endpoints today. The Phase 1 plan should name that absence so future endpoint additions know they need ownership coverage.
- Because schema allows nullable ownership fields for migration/development safety, integration tests should prefer public API setup and public API assertions. Direct repository assertions are useful for owner assignment but should not become copies of production query logic.

## Historical Context

- P-01 introduced the account-owned planner slice and defined the backend as the ownership source of truth, not the frontend ([plan.md](/Applications/portfolio-apps/daily-board/context/changes/minimal-account-owned-planner/plan.md:5), [plan.md](/Applications/portfolio-apps/daily-board/context/changes/minimal-account-owned-planner/plan.md:19)).
- The P-01 plan deliberately kept planner DTO/API shape stable and server-side ownership hidden from client DTOs ([plan.md](/Applications/portfolio-apps/daily-board/context/changes/minimal-account-owned-planner/plan.md:46), [plan.md](/Applications/portfolio-apps/daily-board/context/changes/minimal-account-owned-planner/plan.md:203)).
- P-01 originally scoped duty ownership narrowly, but implementation review found duty endpoints could bypass account ownership by raw `plannerId`; that was fixed by protecting `/api/v1/duties/**` and resolving duty service operations through the authenticated planner owner ([impl-review.md](/Applications/portfolio-apps/daily-board/context/changes/minimal-account-owned-planner/reviews/impl-review.md:23), [impl-review.md](/Applications/portfolio-apps/daily-board/context/changes/minimal-account-owned-planner/reviews/impl-review.md:35)).
- The current Phase 1 rollout explicitly inherits that lesson: filtered planner lists are not proof that detail or child-duty access is safe ([change.md](/Applications/portfolio-apps/daily-board/context/changes/testing-ownership-boundary-api-coverage/change.md:12)).
- `context/archive/` currently contains no archived change notes beyond its README; no archived ownership research was available.

## Related Research

- No previous `research.md` was found for the ownership changes. Relevant historical material is in `context/changes/minimal-account-owned-planner/plan.md` and `context/changes/minimal-account-owned-planner/reviews/impl-review.md`.

## Verification

- `cd backend/dailyboard-backend && ./mvnw test`: failed with the default Java runtime because the project compiles with `release 22`.
- `cd backend/dailyboard-backend && JAVA_HOME=$(/usr/libexec/java_home -v 22) ./mvnw test`: failed inside the sandbox because Mockito/Byte Buddy could not self-attach to the current VM.
- `cd backend/dailyboard-backend && JAVA_HOME=$(/usr/libexec/java_home -v 22) ./mvnw test`: passed outside the sandbox with `Tests run: 12, Failures: 0, Errors: 0, Skipped: 0`.

## Open Questions

- Should Phase 1 extract a shared backend API test helper, or keep duplication local to stay narrowly scoped?
- Should invalid-token coverage be included in Phase 1, or deferred to the auth/session frontend/backend phase? It is adjacent to protected API boundaries but not strictly cross-user ownership.
- When planner/duty update/delete endpoints are added, what exact API contracts should they use for cross-user denial: preserve `404`, or introduce a distinct permission error?
