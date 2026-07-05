<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Minimal Account-Owned Planner Implementation Plan

- **Plan**: `context/changes/minimal-account-owned-planner/plan.md`
- **Scope**: Full implementation review, phases 1-4
- **Date**: 2026-05-27
- **Verdict**: APPROVED after triage
- **Findings**: 1 critical, 1 warning, 1 observation; 0 open

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | PASS |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 — Duty endpoints bypass account ownership

- **Severity**: ❌ CRITICAL
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/config/SecurityConfig.java:43`
- **Detail**: The implementation authenticates `/api/v1/planners/**`, but leaves `/api/v1/duties/**` covered by `.anyRequest().permitAll()`. `DutyController` exposes create/read routes by raw `plannerId`, and `DutyService` uses unscoped `findByPlannerId`, `findByPlannerIdAndEffectiveDateBetween`, and `plannerRepository.findById`. A caller who knows another user's planner id can read that planner's duties or create duties on it, bypassing the P-01 backend ownership boundary. This also contradicts the plan guardrail that duty work is out of scope only beyond avoiding accidental planner access leaks.
- **Fix**: Protect `/api/v1/duties/**` and scope duty service operations through the authenticated planner owner before saving or reading duties.
  - Strength: Closes the same account-boundary class already handled for planner list/detail, while preserving existing board/week behavior for the owning user.
  - Tradeoff: Requires small backend service/repository/test changes beyond the planner-only code path.
  - Confidence: HIGH — the leak is visible directly in `SecurityConfig`, `DutyController`, and `DutyService`.
  - Blind spot: I did not verify every frontend duty call after this change because review mode does not apply fixes.
- **Decision**: FIXED — `/api/v1/duties/**` now requires authentication, duty service operations resolve the planner through the current authenticated owner, and `DutyOwnershipTest` covers owner create/read plus cross-user create/read rejection.

### F2 — Backend automated gate could not run in this environment

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Success Criteria
- **Location**: `backend/dailyboard-backend/pom.xml:32`
- **Detail**: `./mvnw test` failed before executing tests because the current shell uses Java 17 while the project requires Java 22: `Fatal error compiling: error: release version 22 not supported`. This appears to be an environment/toolchain mismatch, not a feature-code regression, but the backend automated success criteria were not independently verified during this review run.
- **Fix**: Re-run `cd backend/dailyboard-backend && ./mvnw test` with a Java 22 JDK active and record the result.
- **Decision**: FIXED — reran backend tests with Java 22 outside the sandbox using `JAVA_HOME=$(/usr/libexec/java_home -v 22) ./mvnw clean test`; result: `Tests run: 12, Failures: 0, Errors: 0, Skipped: 0`, `BUILD SUCCESS`.

### F3 — Handwritten auth API fallback lacks implementation note

- **Severity**: ⚠️ OBSERVATION
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Plan Adherence
- **Location**: `frontend/src/app/core/auth/auth-api.service.ts:8`
- **Detail**: The plan allowed a handwritten auth API service outside `src/api` only if OpenAPI generation was blocked locally and the reason was documented in implementation notes. The implementation uses `AuthApiService`, but I found no note explaining why generation was skipped.
- **Fix**: Add a short implementation note to the change documentation explaining why the auth API client was handwritten instead of regenerated.
- **Decision**: FIXED — added an implementation note to `plan.md` documenting that `AuthApiService` was handwritten because OpenAPI generation was skipped locally and generated clients were not hand-edited.

## Verification

- `cd backend/dailyboard-backend && ./mvnw test`: FAIL/BLOCKED before tests due Java 17 runtime with project Java 22 release target.
- `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`: PASS, `TOTAL: 244 SUCCESS`.
- `cd frontend && npm run lint`: FAIL, 57 problems, matching the documented repo-wide generated API and pre-existing lint debt.
- `cd frontend && npm run build`: PASS with existing Sass/CommonJS/budget warnings.

## Post-Triage Verification

- `cd backend/dailyboard-backend && JAVA_HOME=$(/usr/libexec/java_home -v 22) ./mvnw clean test`: PASS, `Tests run: 12, Failures: 0, Errors: 0, Skipped: 0`.
- Frontend auth/store tests were not rerun because no frontend runtime code changed during triage.
- Frontend build was not rerun after triage because no frontend runtime code changed during triage.

## Notes

- The expired persisted token behavior is already documented as a known limitation and was not treated as a finding for P-01.
- Manual refresh while the token is still valid is recorded as completed in the plan.
