# Minimal Account-Owned Planner Implementation Plan

## Overview

Implement P-01 from the Daily Board roadmap as the first account-owned vertical slice: a user can register, log in, log out, create a planner owned by their account, and a second user cannot see that planner. The slice is intentionally minimal and preserves the current planner/board foundation for later roadmap items.

## Current State Analysis

Daily Board already has planner creation, planner listing, planner detail loading, duty loading, board rendering, and dynamic week switching. The missing piece for P-01 is an account boundary: there is no user table, no authentication endpoint, no token/session model, no owner relation on planners, and no frontend auth state or route protection.

Backend planner endpoints are currently unprotected and global. `PlannerController` exposes create/list/detail routes under `/api/v1/planners`, and `PlannerService#getPlanners()` delegates to `plannerRepository.findAll()`, so every planner is visible to every caller. The initial Flyway schema creates only `planner` and `duty`, with no ownership columns.

Frontend routes currently redirect the root path to `/planners`, and the planners route resolves planner data immediately. That means unauthenticated users would trigger protected API calls unless the implementation adds route guarding and an auth entry point. The frontend already has NgRx, generated OpenAPI services, and a local storage wrapper that can store a minimal auth token.

## Desired End State

After this plan is complete, a new visitor lands on a minimal auth screen, can register, log in, create a planner, log out, register or log in as another user, and see that the first user's planner is not listed. Logging back in as the first user shows the original owned planner again.

The backend enforces this ownership boundary, not just the frontend. Planner create/list/detail endpoints require a valid bearer token; saved planners are tied to the authenticated user; planner list returns only the current user's planners; and direct access to another user's planner does not expose planner data.

### Key Discoveries:

- Backend Spring Security is not active; `spring-boot-starter-security` is commented out in `backend/dailyboard-backend/pom.xml:44`.
- Existing schema has only `planner` and `duty` tables, with no user or owner relation in `backend/dailyboard-backend/src/main/resources/db/migration/V1__init_tables.sql:1`.
- `PlannerService#getPlanners()` currently returns all rows through `plannerRepository.findAll()` in `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:23`.
- Angular root routing currently redirects unauthenticated visitors to `/planners` in `frontend/src/app/views/routes.ts:17`.
- `plannersResolver` dispatches planner loading before any auth concept exists in `frontend/src/app/resolvers/planners.resolver.ts:10`.
- Frontend API base URL is already centralized through `ApiConfiguration` in `frontend/src/app/app.config.ts:33`.
- A local storage wrapper already exists and can support token persistence in `frontend/src/app/core/services/persistance/persistance.service.ts:5`.

## What We're NOT Doing

- No AI planning flow, proposal preview, acceptance, or dismissal.
- No task/event/duty ownership work beyond avoiding accidental planner access leaks required by P-01.
- No planner edit/delete or duty edit/delete.
- No roles, shared planners, admin behavior, or advanced permission model.
- No refresh-token flow, token revocation, password reset, email verification, account profile, or production auth hardening.
- No production deployment, infrastructure work, rate limiting, audit logging, or performance tuning.
- No board architecture rewrite and no changes to dynamic week switching behavior unless needed only to keep the existing route working after auth.
- No migration that preserves existing development planner rows for a real user.

## Implementation Approach

Use a stateless JWT access-token flow for the MVP. The backend owns the security boundary with Spring Security, password hashing, authenticated principal resolution, and owner-scoped planner queries. The frontend adds a minimal auth screen, persists the token locally, attaches it to API requests, guards planner routes, and clears planner-visible state on logout.

Planner ownership should remain server-side only. `PlannerDto` does not need an `ownerId`, which keeps the current planner UI contract stable and reduces generated client churn. Existing development rows may remain in the database but are not shown to new authenticated users unless they are explicitly associated during development outside this plan.

## Phase 1: Backend Auth Foundation

### Overview

Add the minimal backend account model and authentication endpoints needed for registration, login, and authenticated request handling.

### Changes Required:

#### 1. Backend Dependencies

**File**: `backend/dailyboard-backend/pom.xml`

**Intent**: Enable Spring Security and auth test support for the backend. This turns the existing commented security dependency into an active part of the application.

**Contract**: Add `spring-boot-starter-security` and `spring-security-test` as Maven dependencies while preserving the existing Spring Boot 3.4.0 setup.

#### 2. User Schema Migration

**File**: `backend/dailyboard-backend/src/main/resources/db/migration/V2__create_users.sql`

**Intent**: Add the account table required for email/password registration.

**Contract**: Create an application user table with UUID/string primary key, unique non-null email, non-null password hash, and timestamp fields if consistent with local style. Do not modify `V1__init_tables.sql`.

#### 3. User Persistence Model

**Files**:

- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/model/dao/User.java`
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/repository/UserRepository.java`

**Intent**: Represent registered users and allow lookup by email during registration, login, and token authentication.

**Contract**: `UserRepository` exposes an email lookup and uniqueness checks. The entity maps to the new user table and stores only the password hash, never a plain password.

#### 4. Auth DTOs

**Files**:

- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/model/dto/AuthRequestDto.java`
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/model/dto/AuthResponseDto.java`
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/model/dto/UserDto.java`

**Intent**: Define a compact API contract for registration and login.

**Contract**: Register and login accept email/password. Successful responses include a bearer token and a minimal user payload with id/email. No password hash appears in any response DTO.

#### 5. Token Service

**File**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/JwtService.java`

**Intent**: Issue and validate short-lived-enough JWT access tokens for the MVP without introducing refresh tokens.

**Contract**: Token subject identifies the user, token validation rejects invalid/expired tokens, and signing secret/expiration are configurable through application properties or environment variables with local defaults suitable for development.

#### 6. Auth Service and Controller

**Files**:

- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/AuthService.java`
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/AuthController.java`

**Intent**: Expose register and login endpoints and centralize password hashing and credential validation.

**Contract**: Add `/api/v1/auth/register` and `/api/v1/auth/login`. Registration returns `409 Conflict` for duplicate email. Login returns `401 Unauthorized` for invalid credentials. Both success paths return the shared auth response contract.

#### 7. Security Configuration

**Files**:

- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/config/SecurityConfig.java`
- `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/config/JwtAuthenticationFilter.java`

**Intent**: Protect API routes and resolve the authenticated user from bearer tokens.

**Contract**: Permit auth endpoints and OpenAPI/dev documentation routes if needed. Require authentication for `/api/v1/planners/**`. Use stateless sessions, BCrypt password encoding, and bearer token parsing from the `Authorization` header. Keep CORS compatible with the existing Angular local origin.

#### 8. Auth Error Handling

**File**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/exepctions/GlobalExceptionHandler.java`

**Intent**: Return predictable MVP errors for auth and ownership failures.

**Contract**: Map duplicate registration to `409`, invalid login/auth to `401`, and forbidden or missing planner access to a non-leaking `403` or `404`. Preserve existing duty conflict behavior.

### Success Criteria:

#### Automated Verification:

- Backend compiles: `cd backend/dailyboard-backend && ./mvnw test`
- Auth endpoints are present in generated OpenAPI docs when backend is running.
- Backend tests cover successful registration, duplicate registration, successful login, invalid login, and protected planner endpoint rejection without a token.

#### Manual Verification:

- Registering a new email returns a token and user email.
- Logging in with the same email/password returns a token.
- Calling a protected planner endpoint without `Authorization: Bearer <token>` is rejected.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Planner Ownership Enforcement

### Overview

Attach planners to the authenticated user and make planner create/list/detail endpoints account-scoped on the backend.

### Changes Required:

#### 1. Planner Owner Migration

**File**: `backend/dailyboard-backend/src/main/resources/db/migration/V3__add_planner_owner.sql`

**Intent**: Add the database relationship that makes planners account-owned.

**Contract**: Add a nullable-or-development-safe `owner_id` column to `planner`, index it, and add a foreign key to the user table. Existing dev rows may remain unowned and should not appear in authenticated user lists unless manually associated outside this plan.

#### 2. Planner Entity Ownership

**File**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/model/dao/Planner.java`

**Intent**: Model the owner relation while keeping `PlannerDto` unchanged.

**Contract**: Add a `ManyToOne` owner relation to `User`. Prevent owner data from being serialized through planner DTO mapping.

#### 3. Owner-Scoped Planner Repository

**File**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/repository/PlannerRepository.java`

**Intent**: Support querying planners by authenticated owner.

**Contract**: Add owner-scoped methods for list and detail lookup, such as finding all planners by owner id and finding a planner by id plus owner id.

#### 4. Authenticated User Access

**File**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/AuthenticatedUserService.java`

**Intent**: Provide a small backend helper for services/controllers that need the current user.

**Contract**: Resolve the current authenticated `User` from Spring Security context or throw an auth error if no valid user is available.

#### 5. Planner Service Scoping

**File**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java`

**Intent**: Ensure planner creation and reads are scoped to the current user.

**Contract**: `savePlanner` sets the owner from the authenticated user and ignores any client-supplied owner concept. `getPlanners` returns only planners owned by the authenticated user. `getPlanner` returns only a planner owned by the authenticated user or throws a non-leaking not-found/forbidden error.

#### 6. Planner Controller Principal Flow

**File**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/PlannerController.java`

**Intent**: Keep the public planner API shape stable while making the service call path authenticated.

**Contract**: Existing planner routes remain `/api/v1/planners`, `/api/v1/planners/all`, and `/api/v1/planners/{id}`. Request/response DTOs remain planner DTOs without owner fields.

#### 7. Backend Ownership Tests

**Files**:

- `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/AuthControllerTest.java`
- `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/PlannerOwnershipTest.java`

**Intent**: Prove the P-01 backend contract independently of the Angular app.

**Contract**: Tests create User A and User B, create a planner as User A, verify User A can list it, verify User B cannot list it, and verify direct detail access by User B does not expose the planner.

### Success Criteria:

#### Automated Verification:

- Backend ownership tests pass: `cd backend/dailyboard-backend && ./mvnw test`
- Planner create stores an owner for newly created planners.
- Planner list never uses an unscoped `findAll()` path for authenticated API requests.
- Direct planner lookup is scoped by planner id and owner.

#### Manual Verification:

- With User A token, create a planner and confirm it appears in User A planner list.
- With User B token, confirm User A's planner does not appear in User B planner list.
- With User B token, direct `GET /api/v1/planners/{userAPlannerId}` does not return User A planner data.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Frontend Auth Shell

### Overview

Add minimal Angular auth state, token persistence, bearer-token request attachment, route guarding, and a login/register UI.

### Changes Required:

#### 1. Regenerate or Extend API Client

**Files**:

- `frontend/src/api/**`
- `frontend/openapi-config.json`

**Intent**: Make the frontend aware of backend auth endpoints.

**Contract**: Prefer regenerating the OpenAPI client after backend auth endpoints exist. If generation is blocked locally, add a small handwritten auth API service outside `src/api` and document why in implementation notes.

#### 2. Auth Models and Service

**Files**:

- `frontend/src/app/core/auth/auth.models.ts`
- `frontend/src/app/core/auth/auth.service.ts`

**Intent**: Centralize token/user state, registration, login, logout, and startup restoration.

**Contract**: The service stores the auth response in `PersistenceService`, exposes the current user/token state as Angular-friendly state, removes auth data on logout, and does not store passwords.

#### 3. Bearer Token Interceptor

**File**: `frontend/src/app/core/auth/auth.interceptor.ts`

**Intent**: Attach the JWT to API requests without changing each NgRx effect.

**Contract**: For requests to the configured backend API base URL, add `Authorization: Bearer <token>` when a token exists. Do not attach auth headers to local asset requests such as `/assets/app-config.json`.

#### 4. Auth Guard

**File**: `frontend/src/app/core/auth/auth.guard.ts`

**Intent**: Prevent unauthenticated access to planner routes and avoid resolver calls before auth.

**Contract**: Unauthenticated users are redirected to `/auth`. Authenticated users can access `/planners`, `/planner-add`, `/choose-planner`, planner detail routes, and task add routes.

#### 5. Minimal Auth Page

**Files**:

- `frontend/src/app/views/auth/auth.component.ts`
- `frontend/src/app/views/auth/auth.component.html`
- `frontend/src/app/views/auth/auth.component.scss`
- `frontend/src/app/views/auth/auth.component.spec.ts`

**Intent**: Provide the single combined login/register page needed for the vertical slice.

**Contract**: The page supports switching between login and register modes, captures email/password, shows existing snackbar-style errors where practical, routes successful auth to `/planners`, and keeps the UX minimal.

#### 6. Route Wiring

**File**: `frontend/src/app/views/routes.ts`

**Intent**: Put auth in front of planner workflows without changing board internals.

**Contract**: Add `/auth`; guard planner-related routes; keep the root redirect behavior sensible for auth state. Do not change the dynamic planner route contract `planners/:plannerId/:isDynamic`.

#### 7. App HTTP Provider

**File**: `frontend/src/app/app.config.ts`

**Intent**: Register the auth interceptor in the Angular standalone provider setup.

**Contract**: Preserve `withFetch()`, runtime API configuration, NgRx, translations, and existing provider behavior while adding interceptor support.

### Success Criteria:

#### Automated Verification:

- Frontend tests pass: `cd frontend && npm test`
- Frontend lint passes: `cd frontend && npm run lint`
- Auth service tests cover token persistence, logout clearing, and restored auth state.
- Auth guard tests cover unauthenticated redirect and authenticated access.
- Auth interceptor tests cover attaching bearer token to API calls and skipping asset calls.

#### Manual Verification:

- Visiting `/planners` while logged out redirects to `/auth`.
- Registering from the auth page lands on `/planners`.
- Logging out removes local auth state and prevents access to `/planners`.
- Refreshing the browser after login keeps the user authenticated for the MVP token lifetime.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 4: End-to-End Planner Vertical Slice

### Overview

Connect the authenticated frontend planner workflow to the ownership-enforced backend and verify the exact P-01 user journey.

### Changes Required:

#### 1. Logout Entry Point

**Files**:

- `frontend/src/app/shared/components/side-menu/side-menu.component.ts`
- `frontend/src/app/shared/components/side-menu/side-menu.component.html`
- `frontend/src/app/shared/components/side-menu/side-menu.component.spec.ts`

**Intent**: Give the user a visible way to end the session.

**Contract**: Add a minimal logout action that calls `AuthService.logout()`, clears auth state, and redirects to `/auth`. Keep existing planner navigation and add-planner navigation intact.

#### 2. Planner Store Reset on Logout

**Files**:

- `frontend/src/app/shared-store/planner-store/planner.actions.ts`
- `frontend/src/app/shared-store/planner-store/planner.reducer.ts`
- `frontend/src/app/shared-store/duty-store/duty.actions.ts`
- `frontend/src/app/shared-store/duty-store/duty.reducer.ts`

**Intent**: Prevent User A planner data cached in NgRx from being visible after User B logs in during the same browser session.

**Contract**: Add clear/reset actions for planner and duty store state and dispatch them during logout. The reset returns stores to their initial states without changing existing load/save success behavior.

#### 3. Planner Effects With Authenticated API Calls

**Files**:

- `frontend/src/app/shared-store/planner-store/planner.effects.ts`
- `frontend/src/app/resolvers/planners.resolver.ts`

**Intent**: Keep planner list/create effects working once the backend requires bearer auth.

**Contract**: Effects continue to call the generated planner service. The resolver runs only behind the auth guard. 401/403 responses show existing error feedback and should not leave `allPlannersLoaded` stuck in a misleading state.

#### 4. Planner Form Authenticated Save

**Files**:

- `frontend/src/app/views/planner-form/planner-form.component.ts`
- `frontend/src/app/views/planner-form/planner-form.component.spec.ts`

**Intent**: Preserve the existing add-planner behavior under authentication.

**Contract**: Existing planner form model and DTO shape stay unchanged. The backend assigns ownership; the frontend does not send owner fields. Successful save still redirects to `/planners` when requested.

#### 5. Dashboard Cross-User Behavior

**Files**:

- `frontend/src/app/views/planners-dashboard/planners-dashboard.component.ts`
- `frontend/src/app/views/planners-dashboard/planners-dashboard.component.html`
- `frontend/src/app/views/planners-dashboard/planners-dashboard.component.spec.ts`

**Intent**: Ensure the planner dashboard renders only the authenticated user's server-scoped planner list and behaves cleanly for User B's empty list.

**Contract**: Dashboard still uses `selectAllPlanners`. No frontend filtering by user id is introduced. The no-planners state remains usable for User B.

#### 6. Manual Smoke Script

**File**: `context/changes/minimal-account-owned-planner/manual-smoke.md`

**Intent**: Capture the required P-01 manual verification steps for repeatable implementation review.

**Contract**: Document the exact flow: register User A, create planner, logout, register/login User B, verify User A planner absent, logout, login User A, verify User A planner present.

### Success Criteria:

#### Automated Verification:

- Backend tests pass: `cd backend/dailyboard-backend && ./mvnw test`
- Frontend tests pass: `cd frontend && npm test`
- Frontend lint passes: `cd frontend && npm run lint`
- Frontend build passes: `cd frontend && npm run build`
- Store reset tests prove logout removes cached planner/duty data.

#### Manual Verification:

- Register User A in the browser.
- Create a planner as User A.
- Logout User A.
- Register or login User B in the same browser.
- Confirm User B does not see User A's planner.
- Logout User B and login User A again.
- Confirm User A sees the planner created earlier.
- Open an existing dynamic planner route for User A and confirm week switching still works if that planner has duties; if no duties exist in P-01 data, confirm the route still renders without breaking the week switch controls.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before marking the change implemented.

---

## Testing Strategy

### Unit Tests:

- Backend auth service: registration, duplicate email, password hashing, successful login, invalid password.
- Backend JWT service/filter: valid token resolves user, invalid or missing token is rejected.
- Backend planner ownership: User A planner is listed for User A and not listed or returned for User B.
- Frontend auth service: token persistence, auth state restore, logout clearing.
- Frontend auth guard: unauthenticated redirect and authenticated route access.
- Frontend auth interceptor: attaches bearer token to backend API calls and skips asset/config requests.
- Frontend reducers: logout/reset clears planner and duty state.

### Integration Tests:

- Backend controller tests for `/api/v1/auth/register`, `/api/v1/auth/login`, protected planner create/list/detail routes, and cross-user planner access.
- Frontend component tests for auth page mode switching and successful auth navigation.
- Existing planner form/dashboard tests updated only where auth-aware setup is required.

### Manual Testing Steps:

1. Start MySQL and backend locally.
2. Start the Angular frontend locally.
3. Navigate to `/planners` while logged out and verify redirect to `/auth`.
4. Register User A.
5. Create a planner named clearly for User A.
6. Logout.
7. Register or login User B.
8. Verify User B's planner dashboard does not show User A's planner.
9. Logout.
10. Login User A.
11. Verify User A's planner is visible.
12. Navigate into User A's planner and confirm the existing board route renders.

## Performance Considerations

P-01 assumes small local/dev data volume from the roadmap. Owner-scoped planner queries should use an index on `planner.owner_id` so the ownership filter does not become a future bottleneck. No caching, pagination, or performance optimization is required in this slice.

## Migration Notes

Existing planner rows are development/test data and do not need to be preserved for a real user. The migration may leave existing rows without an owner if MySQL constraints require a safe transition, but authenticated planner list/detail routes must not expose unowned rows. If a local developer wants to keep old rows, they can associate them manually outside this MVP plan.

## Known Limitations

- When a persisted token is expired, API calls return `401`, but the frontend does not automatically clear auth state or redirect to `/auth`.
- This is out of scope for P-01 because the refresh check verifies browser refresh behavior while the token is still valid.
- Suggested future fix: handle `401` responses from API requests in the auth interceptor by clearing auth/session state and redirecting to `/auth`, without reintroducing the `AuthService` circular dependency.

## References

- Roadmap P-01: `context/foundation/roadmap.md`
- PRD ownership and auth scope: `context/foundation/prd.md`
- Change identity: `context/changes/minimal-account-owned-planner/change.md`
- Backend current planner controller: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/PlannerController.java:21`
- Backend current planner service: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:19`
- Backend current schema: `backend/dailyboard-backend/src/main/resources/db/migration/V1__init_tables.sql:1`
- Frontend current routes: `frontend/src/app/views/routes.ts:17`
- Frontend current planner resolver: `frontend/src/app/resolvers/planners.resolver.ts:10`
- Frontend persistence service: `frontend/src/app/core/services/persistance/persistance.service.ts:5`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Backend Auth Foundation

#### Automated

- [x] 1.1 Backend compiles — 9a45db5
- [ ] 1.2 Auth endpoints are present in generated OpenAPI docs when backend is running
- [x] 1.3 Backend tests cover successful registration, duplicate registration, successful login, invalid login, and protected planner endpoint rejection without a token — 9a45db5

#### Manual

- [x] 1.4 Registering a new email returns a token and user email — 9a45db5
- [x] 1.5 Logging in with the same email/password returns a token — 9a45db5
- [ ] 1.6 Calling a protected planner endpoint without Authorization is rejected

### Phase 2: Planner Ownership Enforcement

#### Automated

- [x] 2.1 Backend ownership tests pass — 9a45db5
- [x] 2.2 Planner create stores an owner for newly created planners — 9a45db5
- [x] 2.3 Planner list never uses an unscoped findAll path for authenticated API requests — 9a45db5
- [x] 2.4 Direct planner lookup is scoped by planner id and owner — 9a45db5

#### Manual

- [x] 2.5 With User A token, create a planner and confirm it appears in User A planner list — 9a45db5
- [x] 2.6 With User B token, confirm User A's planner does not appear in User B planner list — 9a45db5
- [ ] 2.7 With User B token, direct planner detail access does not return User A planner data

### Phase 3: Frontend Auth Shell

#### Automated

- [x] 3.1 Frontend tests pass — 9a45db5
- [ ] 3.2 Frontend lint passes
- [x] 3.3 Auth service tests cover token persistence, logout clearing, and restored auth state — 9a45db5
- [x] 3.4 Auth guard tests cover unauthenticated redirect and authenticated access — 9a45db5
- [x] 3.5 Auth interceptor tests cover attaching bearer token to API calls and skipping asset calls — 9a45db5

#### Manual

- [x] 3.6 Visiting /planners while logged out redirects to /auth — 9a45db5
- [x] 3.7 Registering from the auth page lands on /planners — 9a45db5
- [x] 3.8 Logging out removes local auth state and prevents access to /planners — 9a45db5
- [x] 3.9 Refreshing the browser after login keeps the user authenticated for the MVP token lifetime — manual refresh check completed successfully

### Phase 4: End-to-End Planner Vertical Slice

#### Automated

- [x] 4.1 Backend tests pass — 9a45db5
- [x] 4.2 Frontend tests pass — 9a45db5
- [ ] 4.3 Frontend lint passes — waived/blocked by pre-existing repo-wide lint debt: `npm run lint` still reports 57 generated `src/api` and unrelated existing app lint/style problems; the Phase 4 side-menu lint issue was fixed.
- [x] 4.4 Frontend build passes — 9a45db5
- [x] 4.5 Store reset tests prove logout removes cached planner/duty data — 9a45db5

#### Manual

- [x] 4.6 Register User A in the browser — 9a45db5
- [x] 4.7 Create a planner as User A — 9a45db5
- [x] 4.8 Logout User A — 9a45db5
- [x] 4.9 Register or login User B in the same browser — 9a45db5
- [x] 4.10 Confirm User B does not see User A's planner — 9a45db5
- [x] 4.11 Logout User B and login User A again — 9a45db5
- [x] 4.12 Confirm User A sees the planner created earlier — 9a45db5
- [x] 4.13 Confirm the existing dynamic planner route still renders and week switching is not regressed — 9a45db5
