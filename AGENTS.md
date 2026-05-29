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

## 10xDevs AI Toolkit - Module 2, Lesson 3

Review AI-generated code before merge with the **implementation review chain**:

```
/10x-implement -> /10x-impl-review -> triage -> (/10x-lesson | fix | skip | disagree)
```

`/10x-impl-review` is the lesson focus. Review is a quality gate, not an instruction to fix every finding.

### Task Router - Where to start

| Skill | Use it when |
| --- | --- |
| **Code review (lesson focus)** | |
| `/10x-impl-review <change-id>` | You have implemented code and want a structured review before merge. The skill checks plan adherence, scope discipline, safety and quality, architecture, pattern consistency, and success criteria, then presents findings for triage. |
| **Recurring lesson outcome** | |
| `/10x-lesson` | A finding reveals a recurring project rule or agent failure pattern. Record it in `context/foundation/lessons.md` instead of treating it as a one-off note. |

### Triage discipline

- Severity says how bad the finding is. Impact says how much the decision matters now.
- Valid outcomes: fix now, fix differently, skip, accept as risk, record as recurring rule (`/10x-lesson`), disagree.
- Fix critical findings. Do not burn hours on low-impact observations just because the agent found them.
- Conscious skipping of low-impact findings is a valid review outcome, not negligence.
- If you disagree with a finding, record why. Wrong agent reasoning is also signal.

### Review boundaries

- This lesson reviews implemented code. It does not create the plan, execute new phases, or teach CI review.
- Testing strategy and quality gates are introduced in Module 3.
- Do not use `/10x-contract` as a triage outcome in this lesson.

### Paths used by this lesson

- `context/changes/<change-id>/plan.md` - expected implementation contract
- `context/changes/<change-id>/reviews/` - review output
- `context/foundation/lessons.md` - recurring lessons

Skills must not write to `context/archive/`. Archived changes are immutable; if a resolved target path starts with `context/archive/`, abort with: "This change is archived. Open a new change with `/10x-new` instead."

<!-- END @przeprogramowani/10x-cli -->
