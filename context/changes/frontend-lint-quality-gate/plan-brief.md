# Frontend Lint Quality Gate — Plan Brief

> Full plan: `context/changes/frontend-lint-quality-gate/plan.md`  
> Research: `context/changes/frontend-lint-quality-gate/research.md`

## What & Why

Create a clean frontend lint baseline and make lint an early, required step of
the existing frontend CI job. Keep generator-owned OpenAPI output separate and
preserve chip removal, board animation, and dynamic week switching.

## Starting Point

Full lint reports 70 errors and 14 warnings. Generated `frontend/src/api/**`
contributes 30 errors and ten warnings; authored code contributes 40 errors
and four warnings. CI runs frontend tests/build and backend tests, but no lint.

## Desired End State

Local lint passes with zero current errors and warnings, generated API files
remain untouched, and frontend tests/build stay green. CI runs lint before
tests/build; errors block while warnings retain their configured severity.

## Key Decisions Made

| Decision | Choice | Why | Source |
|---|---|---|---|
| Generated API | Global flat-config ignore for `src/api/**` | Generator output is overwritten and already disables ESLint internally | Research |
| Warnings | Remove current four; keep future warnings nonblocking | Starts clean without silently tightening repo policy | Plan |
| Output coverage | Existing tests plus strict production build | Cheapest signal for a lint-scoped rename; no new test scope | Plan |
| CI shape | One lint step in the existing frontend job | Reuses installation and fails fast | Research |
| Required gate | Workflow only; no branch-protection changes | Keeps work inside the repository and available authority | Plan |
| Delivery | Four phases with a checkpoint after output renames | Separates mechanical changes from template contracts | Plan |

## Scope

**In scope:**

- Global generated-source ignore plus authored autofix and manual lint cleanup.
- Atomic `chipRemoved` and `plannerAnimationEnd` output renames.
- Frontend verification, CI lint step, and CI section update in `AGENTS.md`.

**Out of scope:**

- Generated-client changes, contract drift, or warning-as-error policy.
- GitHub branch protection, new tests, e2e, hooks, backend/dependency changes.
- Archive, health-check, and frozen test-plan edits.

## Architecture / Approach

Treat generated and authored source as separate quality surfaces. Establish
the boundary, clean authored code, verify output contracts through Angular
compilation and tests, then enable the green command in CI.

## Phases at a Glance

| Phase | What it delivers | Key risk |
|---|---|---|
| 1. Boundary + autofix | Generated ignore and reviewable mechanical cleanup | Autofix touching generated or unrelated code |
| 2. Manual cleanup | Typed helpers, valid dynamic fixtures, zero warnings | Types or fixtures changing test meaning |
| 3. Output contracts | Renamed event chains with green lint/test/build | Stale nested template binding |
| 4. CI + guidance | Fail-fast lint gate and accurate agent instructions | Enabling CI before baseline is green |

**Prerequisites:** Frontend dependencies and a Node 22-compatible runtime.  
**Estimated effort:** 1–2 implementation sessions plus hosted CI verification.

## Open Risks & Assumptions

- Production build is the load-bearing check for stale Angular bindings because
  no new output-specific tests are added.
- Future warnings remain nonblocking although this change removes all current warnings.
- Repository rulesets are not changed; a green workflow check does not itself
  prove that GitHub blocks merge on that check.
- OpenAPI client contract drift remains a separate planned quality gate.

## Success Criteria (Summary)

- `npm run lint` passes locally with zero current errors and warnings, and
  generated API files have no diff.
- Existing frontend tests and production build pass after output renames.
- Hosted frontend CI runs lint before tests/build and completes successfully.
