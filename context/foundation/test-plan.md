# Test Plan

> Phased test rollout for this project. Strategy is frozen at the top
> (§1-§5); cookbook patterns at the bottom (§6) fill in as phases ship.
> Read before writing any new test.
>
> Refresh: re-run `/10x-test-plan --refresh` when stale (see §8).
>
> Last updated: 2026-06-01

## 1. Strategy

Tests follow three non-negotiable principles for this project:

1. **Cost x signal.** The cheapest test that gives a real signal for the
   risk wins. Do not promote to e2e because e2e "feels safer." Do not put a
   vision model on top of a deterministic visual diff that already catches
   the regression.
2. **User concerns are first-class evidence.** Risks anchored in "the
   team is worried about X, and the failure would surface somewhere in an
   area" carry the same weight as PRD lines or hot-spot data.
3. **Risks are scenarios, not code locations.** This plan documents *what
   could fail* and *why we believe it's likely* - drawn from documents,
   interview, and codebase *signal* (churn, structure, test base). It does
   NOT claim to know which line owns the failure. That knowledge is
   produced by `/10x-research` during each rollout phase. If the plan and
   research disagree about where the failure lives, research is the
   ground truth.

Hot-spot scope used for likelihood weighting: `frontend/src`,
`backend/dailyboard-backend/src`. The last-30-day scan had usable but small
signal: 7 commits in scope. Highest churn directories were
`frontend/src/app/shared/components`, `backend/dailyboard-backend/src/main/java/com/dailyboard`,
`frontend/src/app/views/auth`, and `frontend/src/app/core/auth`.

## 2. Risk Map

The top failure scenarios this project must protect against, ordered by
risk = impact x likelihood. Risks are failure scenarios in user / business
terms, not test names. The Source column cites the *evidence that surfaced
this risk* - never a specific file as "where the failure lives" (that is
research's job, see §1 principle #3).

| # | Risk (failure scenario) | Impact | Likelihood | Source (evidence - not anchor) |
|---|---|---|---|---|
| 1 | User B can access User A planner or duty through direct endpoint/manual URL even when lists are filtered. | High | High | PRD lines 55, 72, 79, 85, 91; roadmap P-01/P-02; interview Q1-Q4; hot-spot dir `backend/dailyboard-backend/src/main/java/com/dailyboard` |
| 2 | Dynamic board/week switching regresses after ownership scoping or filtered loading changes. | High | High | PRD lines 63, 80, 91-92, 98, 102; roadmap P-02; interview Q1-Q4; hot-spot dir `frontend/src/app/shared/components` |
| 3 | AI proposal writes or mutates planner data before explicit user acceptance. | High | Medium | PRD lines 64, 76-78, 88-90, 109; roadmap P-03/P-04; interview Q1/Q4 |
| 4 | Frontend auth/session state says "logged in" while API rejects requests, leaving stale or misleading protected UI. | Medium | High | Roadmap P-01/P-07; interview Q1-Q4; hot-spot dirs `frontend/src/app/core/auth`, `frontend/src/app/views/auth` |
| 5 | Ownership scoping fails on dependent planner/duty operations across create/detail/update/delete paths, causing missing or leaked data. | High | Medium | PRD lines 85-87, 96-100; roadmap P-02/P-05; interview Q2-Q4 |
| 6 | API/frontend contract drift breaks planning flows while generated client or local UI tests still pass. | Medium | Medium | Stack assessment lines 17-19; health check lines 46-51; roadmap P-01-P04 |

**Impact x Likelihood rubric.** Score both axes on a coarse High / Medium /
Low scale so two readers agree on the same row. High impact means user data,
access, or core planning behavior is wrong. High likelihood means the area is
touched often, has recent churn, or the team has already been burned there.

### Risk Response Guidance

| Risk | What would prove protection | Must challenge | Context `/10x-research` must ground | Likely cheapest layer | Anti-pattern to avoid |
|---|---|---|---|---|---|
| #1 | Cross-user list/detail/direct access never exposes another user's planner or duty data. | A filtered list means detail access and child data are safe. | Auth/session shape, ownership checks, protected API boundaries, and non-leaking error semantics. | Backend integration/API tests, with one e2e smoke later. | Happy-path-only ownership tests. |
| #2 | The selected/visible week remains correct after scoped data reloads and board rendering. | Board worked before ownership, so it still works after scoped loading. | Week state source, data-loading boundary, board rendering inputs, and current user flow. | Frontend component/store integration plus selective e2e. | Brittle visual snapshots. |
| #3 | Proposal preview has no persisted side effect until explicit accept; rejection leaves planner data unchanged. | Showing a preview proves no write happened. | AI proposal boundary, persistence boundary, accept/reject contract, and selected planner ownership. | Backend/API contract or integration tests. | Mocking away persistence or asserting copied implementation behavior. |
| #4 | Expired/rejected auth clears or corrects UI state and blocks protected data display. | A local token means the user is still authenticated. | Token initialization, interceptor behavior, guard behavior, API rejection handling, and UI state reset. | Frontend service/guard/interceptor tests plus one flow test. | Testing Angular mechanics instead of app behavior. |
| #5 | Dependent duty/planner operations preserve ownership on every access path. | Planner ownership automatically protects child data. | Relationship rules, dependent endpoints, update/delete behavior, and direct access behavior. | Backend integration tests. | Copying production query logic into assertions. |
| #6 | Contract drift is caught before planning flows silently fail across generated API/client boundaries. | Generated client means the contract is safe. | OpenAPI generation flow, build/typecheck boundaries, and CI/local gate behavior. | Build/typecheck/API smoke gate. | Testing generated boilerplate directly. |

## 3. Phased Rollout

Each row is a discrete rollout phase that will open its own change folder
via `/10x-new`. Status moves left-to-right through the values below; the
orchestrator updates Status as artifacts appear on disk.

| # | Phase name | Goal (one line) | Risks covered | Test types | Status | Change folder |
|---|---|---|---|---|---|---|
| 1 | Ownership boundary API coverage | Lock down cross-user planner/duty access across list, detail, direct, and dependent paths. | #1, #5 | backend integration/API | change opened | context/changes/testing-ownership-boundary-api-coverage/ |
| 2 | Board and auth state regression coverage | Protect auth/session edge cases and dynamic week switching after scoped loading. | #2, #4 | frontend unit/component/integration | not started | - |
| 3 | AI preview-before-accept coverage | Prove AI proposal preview cannot persist before accept, and accept writes only selected owned planner data. | #3, #1 | backend/API integration, contract | not started | - |
| 4 | Critical-flow e2e and gates | Add minimal critical-flow e2e smoke and lock the quality floor with documented gates. | #1, #2, #3, #6 | e2e smoke, lint/type/build/test gates | not started | - |

**Status vocabulary** (fixed - parser literals):

| Value | Meaning |
|---|---|
| `not started` | No change folder for this rollout phase yet. |
| `change opened` | `context/changes/<id>/` exists with `change.md`; research not done. |
| `researched` | `research.md` exists in the change folder. |
| `planned` | `plan.md` exists with a `## Progress` section. |
| `implementing` | Progress section has at least one `[x]` and at least one `[ ]`. |
| `complete` | Progress section is fully `[x]`. |

## 4. Stack

The classic test base is meaningful: 47 test files were detected across the
Angular frontend and Spring Boot backend. The suite is strongest in
frontend specs and has backend controller/integration coverage for auth and
ownership.

| Layer | Tool | Version | Notes |
|---|---|---|---|
| frontend unit/component | Karma + Jasmine via Angular CLI | Angular 21.2.x, Jasmine 5.1.x, Karma 6.4.x | Existing `npm test` suite covers components, services, auth, reducers, and board components. |
| frontend lint/type/build | angular-eslint, TypeScript, Angular CLI build | eslint 9.x, TypeScript 5.9.x | CI runs frontend test/build; lint/typecheck should be made explicit by Phase 4. |
| backend integration/API | Spring Boot test + Surefire + H2 + Spring Security test | Spring Boot 3.4.0, Java 22 | Existing backend tests cover auth/planner/duty ownership surfaces. |
| API contract | springdoc-openapi + ng-openapi-gen | springdoc 2.7.0, ng-openapi-gen 0.52.x | Contract drift should be guarded by build/typecheck/API smoke rather than generated-client unit tests. |
| e2e | none yet - see §3 Phase 4 | n/a | Add only critical-flow smoke, not a broad e2e matrix. |
| AI-native review | none recommended now - checked: 2026-06-01 | n/a | When NOT to use: do not use AI vision/review where deterministic API, component, or e2e checks catch the risk. |

**Stack grounding tools (current session):**
- Docs: none - no Context7/framework docs MCP exposed in this session; checked: 2026-06-01.
- Search: none via MCP - no Exa/search MCP exposed; local manifests/configs were used; checked: 2026-06-01.
- Runtime/browser: none via MCP - no Playwright/browser automation MCP exposed; checked: 2026-06-01.
- Provider/platform: none - no GitHub/database/provider MCP exposed; checked: 2026-06-01.

## 5. Quality Gates

The full set of gates that must pass before a change reaches production.
"Required after §3 Phase N" means the gate is enforced once that rollout
phase lands; before that, the gate is planned.

| Gate | Where | Required? | Catches |
|---|---|---|---|
| frontend lint + type/build | local + frontend CI | required after §3 Phase 4 | syntactic, template, and type drift |
| frontend unit/component/integration | local + frontend CI | required | auth/session, board/week, component/store regressions |
| backend integration/API | local; CI gap documented | required after §3 Phase 1 | ownership, auth, persistence boundary regressions |
| critical-flow e2e smoke | local/CI once wired by Phase 4 | required after §3 Phase 4 | broken ownership + board/week + AI acceptance flows |
| generated API contract/build smoke | local + CI once wired by Phase 4 | required after §3 Phase 4 | backend/frontend contract drift |
| post-edit hook | local agent loop | recommended after §3 Phase 4 | fast feedback during edits, not a CI substitute |
| deterministic visual diff | optional | optional | selected rendering regressions only if cheaper assertions do not catch them |
| multimodal visual review | optional, selective | optional | visual issues on 1-3 critical screens only; not simple forms |

## 6. Cookbook Patterns

How to add new tests in this project. Each sub-section is filled in once the
relevant rollout phase ships; before that, the sub-section reads "TBD - see
§3 Phase N."

### 6.1 Adding backend ownership/API coverage

Backend ownership/API tests live under
`backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/`.
Prefer extending the narrow ownership test class that owns the behavior
(`PlannerOwnershipTest`, `DutyOwnershipTest`) instead of creating a broad
"all ownership" class. Extract shared helpers only when repeated setup becomes
hard to read.

Use full Spring Boot + MockMvc integration tests with the real auth flow:
register users through `/api/v1/auth/register`, parse the returned JWT, and
send `Authorization: Bearer <token>` on protected planner/duty requests. The
test database is H2 in MySQL mode with Flyway migrations, so setup should use
public API calls where practical and repository access only for narrow
ownership facts that the API cannot expose directly.

Assertion pattern:

- Prove both allowed and denied behavior through API responses, not production
  repository/query internals.
- For cross-user denial, assert the expected non-leaking status (`404` for
  owned-resource lookup misses, `401` for missing/invalid auth) and assert the
  response body does not contain sensitive planner/duty names when a body is
  present.
- For dependent duty paths, challenge the assumption that planner ownership
  automatically protects child data. Cover direct planner-duty reads, dynamic
  range reads, constant-duty filtering, body `plannerId` smuggling on create,
  and cross-user conflict isolation.
- Do not add update/delete ownership tests until those endpoints exist.

Reference tests:

- `DutyOwnershipTest.shouldBlockCrossUserDynamicDutyReadByPlannerId`
- `DutyOwnershipTest.shouldListOnlyCurrentUserConstantDuties`
- `DutyOwnershipTest.shouldAttachCreatedDutyToOwnedPathPlannerWhenBodyPlannerIdDiffers`
- `DutyOwnershipTest.shouldNotConflictWithOverlappingDutiesInAnotherUsersPlanner`
- `DutyOwnershipTest.shouldRejectNewlyCoveredDutyEndpointsWithoutToken`
- `DutyOwnershipTest.shouldRejectDutyEndpointWithInvalidToken`

Run command:

```bash
cd backend/dailyboard-backend && JAVA_HOME=$(/usr/libexec/java_home -v 22) ./mvnw test
```

### 6.2 Adding frontend auth/session coverage

Frontend auth/session tests live near the behavior boundary they protect:

- `frontend/src/app/views/auth/auth.component.spec.ts` for login/register
  success and account-owned store reset.
- `frontend/src/app/shared-store/planner-store/planner.effects.spec.ts` for
  planner detail API rejection recovery.
- `frontend/src/app/shared-store/duty-store/duty.effects.spec.ts` for duty
  load/save API rejection recovery and dynamic save navigation behavior.

Prefer behavior-level tests that prove account-owned state cannot leak across
sessions. On auth success, assert planner and duty stores reset before protected
navigation. On `401`, assert auth is cleared, planner/duty stores reset, and the
user is routed to `/auth`. On `403` or `404`, assert auth remains intact, stale
protected board data is not displayed, and the user is routed back to
`/planners`.

Do not test Angular guard/interceptor mechanics in isolation unless the app
contract changes. The signal is whether Daily Board recovers from stale tokens,
account switches, and inaccessible planner URLs without showing another user's
data.

Reference tests:

- `AuthComponent` successful login/register store-reset tests.
- `planner.effects` `401`, `403`, and `404` planner detail rejection tests.
- `duty.effects` static and dynamic duty rejection tests.
- `duty.effects` dynamic save redirect-to-saved-week test.

Run commands:

```bash
cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/auth/auth.component.spec.ts'
cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared-store/planner-store/planner.effects.spec.ts'
cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared-store/duty-store/duty.effects.spec.ts'
```

### 6.3 Adding board/week-switching regression coverage

Board/week-switching tests should stay at the store, resolver/effect, and
planner-shell boundary. Board rendering components should remain presentational;
they should not learn auth or ownership rules.

Use `frontend/src/app/views/planner/planner.component.spec.ts` for dynamic week
switching behavior: an unloaded week dispatches
`getDutiesByRangeTimeAndPlannerId` and updates the visible range; an already
loaded week updates the visible range without a duplicate fetch. When a dynamic
duty is created for a future or past week, preserve the saved duty's week in
navigation and initialize the board from that range instead of silently opening
the current week.

Use `frontend/src/app/shared-store/duty-store/duty.reducer.spec.ts` for cache
state behavior: static planner loads, dynamic range loads, duplicate range
prevention, and reset behavior. Keep the cache keyed by planner/range unless a
future product change requires user-keyed state; account resets currently own
the user boundary.

Use `frontend/src/app/views/task-board-form/task-board-form.component.spec.ts`
for manual duty creation contracts. Assert saves use the route `plannerId`, set
the correct planner type, and for dynamic planners require at least one added
date chip before dispatching a save.

Run commands:

```bash
cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/planner/planner.component.spec.ts'
cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared-store/duty-store/duty.reducer.spec.ts'
cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/task-board-form/task-board-form.component.spec.ts'
```

### 6.4 Adding AI preview-before-accept coverage

TBD - see §3 Phase 3 for proposal preview, reject, accept, and owned-planner
persistence patterns.

### 6.5 Adding critical-flow e2e smoke

TBD - see §3 Phase 4 for the minimal end-to-end smoke path. Use e2e only for
critical flows that cheaper backend/frontend tests cannot prove.

### 6.6 Per-rollout-phase notes

- Phase 1 (`context/changes/testing-ownership-boundary-api-coverage/`) added
  backend ownership/API coverage for dynamic duties, constant duties, body
  `plannerId` smuggling, cross-user duty conflict isolation, and minimal auth
  rejection consistency. Verification command: `cd backend/dailyboard-backend
  && JAVA_HOME=$(/usr/libexec/java_home -v 22) ./mvnw test`.

## 7. What We Deliberately Don't Test

Exclusions agreed during the rollout interview. Future contributors should
respect these unless the underlying assumption changes.

- **Pixel-perfect snapshots for simple UI** - too brittle for the signal they provide. Re-evaluate only for genuinely critical visual states. (Source: Phase 2 interview Q5.)
- **Angular/Spring framework behavior** - test Daily Board business behavior, not framework mechanics. (Source: Phase 2 interview Q5.)
- **Advanced roles and shared-planner permissions** - MVP has one role and no shared planners. Re-evaluate if shared planners enter scope. (Source: Phase 2 interview Q5.)
- **Full e2e coverage for every small case** - e2e is reserved for critical flows; cheaper layers cover edge cases. (Source: Phase 2 interview Q5.)
- **Generated client / boilerplate unit tests** - guard the real API contract through build/typecheck/API smoke instead. (Source: Phase 2 interview Q5.)
- **Implementation-mirror tests** - assertions must come from product behavior, contracts, or interview evidence, not copied production logic. (Source: Phase 2 interview Q5.)

## 8. Freshness Ledger

- Strategy (§1-§5) last reviewed: 2026-06-01
- Stack versions last verified: 2026-06-01
- AI-native tool references last verified: 2026-06-01

Refresh (`/10x-test-plan --refresh`) when:

- a new top-3 risk surfaces from the roadmap or archive,
- a recommended tool's `checked:` date is older than three months,
- the project's tech stack changes (new framework, new test runner),
- §7 negative-space no longer matches what the team believes.
