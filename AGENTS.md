# Repository Guidelines

Daily Board is a brownfield web app with an Angular + TypeScript frontend and a Spring Boot (Maven) backend, backed by MySQL. Product scope and constraints live in `@context/foundation/prd.md` (auth + per-user ownership + AI proposal acceptance; preserve board/week switching).

## Hard rules

- Never write to `context/archive/` (immutable).
- Keep changes scoped to the requested task; avoid drive-by refactors.
- Preserve the existing planning flow and dynamic week switching behavior (see `@context/foundation/prd.md`).
- If product scope is unclear, check `context/foundation/prd.md` first and ask before making assumptions.

## Project structure

- `frontend/` — Angular app. Scripts and dependencies in `@frontend/package.json`.
- `backend/dailyboard-backend/` — Spring Boot service (Maven). Config in `@backend/dailyboard-backend/pom.xml`.
- `context/foundation/` — living docs (`prd.md`, `stack-assessment.md`, `health-check*.md`).

## Build, test, lint

- Frontend dev: `cd frontend && npm install && npm run start`
- Frontend test: `cd frontend && npm test`
- Frontend lint: `cd frontend && npm run lint`
- Backend test: `cd backend/dailyboard-backend && ./mvnw test`

Type safety is enforced in the frontend via strict TS + strict templates (`@frontend/tsconfig.json`).

## CI/CD

GitHub Actions workflow exists for the frontend only: `@frontend/.github/workflows/ci-cd-pipeline.yml` (runs frontend tests + build). There is no repo-root/backend CI workflow yet.

## Commits

Commit subjects commonly use a ticket prefix like `DB-<number>` (see `git log`). Keep that convention for new commits/PR titles if you add any.

<!-- BEGIN @przeprogramowani/10x-cli -->

## 10xDevs AI Toolkit - Module 2, Lesson 2

Turn one roadmap item into the first implementation cycle with the **change planning chain**:

```
/10x-roadmap -> /10x-new -> /10x-plan -> /10x-plan-review -> /10x-implement
```

`/10x-new`, `/10x-plan`, `/10x-plan-review`, and `/10x-implement` are the lesson focus. `/10x-frame` and `/10x-research` are not required rituals here; they are escalation paths introduced in the next lesson.

### Task Router - Where to start

| Skill | Use it when |
| --- | --- |
| **Change setup (lesson focus)** | |
| `/10x-new <change-id>` | You selected a roadmap item and need a stable change folder. Creates `context/changes/<change-id>/change.md` so planning, implementation, progress, commits, and later review all share one identity. Use AFTER roadmap selection, BEFORE `/10x-plan`. |
| **Planning (lesson focus)** | |
| `/10x-plan <change-id>` | You have a change folder and need a reviewable implementation plan. Reads roadmap context, foundation docs, codebase evidence, and any existing change notes; writes `plan.md` and `plan-brief.md` with phases, file contracts, success criteria, and `## Progress`. |
| **Plan readiness (lesson focus)** | |
| `/10x-plan-review <change-id>` | You have `plan.md` and need a light pre-code readiness check. Use it to catch missing end state, weak contracts, malformed progress, scope drift, or blind spots before code changes begin. |
| **Implementation (lesson focus)** | |
| `/10x-implement <change-id> phase <n>` | You have an approved plan and want to execute one phase with verification, manual gate, commit ritual, and SHA write-back to `## Progress`. |
| **Lifecycle closure** | |
| `/10x-archive <change-id>` | A change is merged or intentionally closed. Move it out of active `context/changes/` into archive state. |

### How the chain hands off

- `/10x-new` creates the durable change identity.
- `/10x-plan` turns that identity into an implementation contract.
- `/10x-plan-review` checks the plan before the agent mutates code.
- `/10x-implement` executes one planned phase, verifies, asks for manual confirmation when needed, commits, and records progress.

### Lesson boundaries

- Plan is the default router after roadmap selection. Start with `/10x-plan` unless the problem is unclear or external evidence is blocking.
- Do not run `/10x-frame + /10x-research` as ceremony for every change.
- Do not turn this lesson into a full end-to-end product build. A checkpoint with a planned and partially or fully implemented stream is valid.
- Code review of the implemented diff belongs to Lesson 3 via `/10x-impl-review`.
- Lifecycle closure via `/10x-archive` after a change is merged or intentionally closed.

### Paths used by this lesson

- `context/foundation/roadmap.md` - upstream roadmap
- `context/changes/<change-id>/change.md` - change identity
- `context/changes/<change-id>/plan.md` - implementation contract
- `context/changes/<change-id>/plan-brief.md` - compressed handoff
- `context/foundation/lessons.md` - recurring rules and pitfalls
- `docs/reference/contract-surfaces.md` - load-bearing names registry

Skills must not write to `context/archive/`. Archived changes are immutable; if a resolved target path starts with `context/archive/`, abort with: "This change is archived. Open a new change with `/10x-new` instead."

<!-- END @przeprogramowani/10x-cli -->
