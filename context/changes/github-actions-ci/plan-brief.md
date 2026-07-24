# GitHub Actions CI - Plan Brief

> Full plan: `context/changes/github-actions-ci/plan.md`
> Research: `context/changes/github-actions-ci/research.md`

## What & Why

Add a working GitHub Actions pipeline that validates both Daily Board modules before and after changes reach `main`. This is continuous integration only; the application will not be deployed.

## Starting Point

The only workflow is nested under `frontend/.github/workflows/`, so GitHub does not discover it. It is also stale and validates neither the current Angular toolchain nor the backend.

## Desired End State

Pull requests to `main` and pushes to `main` run independent frontend and backend jobs. The frontend passes unit tests and production build under Node 22; the backend passes 37 tests under Java 22, including the currently skipped Spring context test.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Delivery scope | CI only | Deployment is optional and explicitly excluded | Research |
| Workflow layout | One root workflow with parallel jobs | GitHub discovers root workflows and failures stay attributable to one module | Research |
| Frontend gates | Unit tests and production build | Both pass now and build supplies strict type/template checking | Research |
| Frontend lint | Excluded from this change | Current baseline has 70 errors and would make CI permanently red | Plan |
| Events | PRs to `main` and pushes to `main` | Validates before and after merge without duplicate feature-branch runs | Plan |
| Backend command | `mvnw test` | Runs the current H2-backed suite without unused coverage output | Plan |
| Context test | Rename to singular `Test` | Matches the existing Surefire convention with the smallest change | Plan |
| E2E and MySQL | Excluded | Existing e2e startup is not cross-platform and backend tests use H2 | Research |

## Scope

**In scope:**

- Rename the skipped Spring context test so Surefire executes it.
- Add `.github/workflows/ci.yml`.
- Run frontend and backend CI jobs in parallel.
- Cache npm and Maven dependencies.
- Remove the inactive nested workflow.
- Verify the first pull-request and post-merge runs.

**Out of scope:**

- Deployment or release automation.
- Frontend lint cleanup.
- Playwright e2e.
- MySQL service containers.
- Security scanning, coverage publishing, and artifacts.
- Application behavior changes.

## Architecture / Approach

GitHub Actions dispatches two independent jobs from one root workflow:

```text
pull_request(main) / push(main)
              |
       +------+------+
       |             |
   frontend       backend
  Node 22         Java 22
 test + build    Maven test
```

Both jobs use explicit module working directories and dependency caches. No shared service or job dependency is needed.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Backend test discovery | Surefire executes the Spring context test; suite reaches 37 tests | Renamed test exposes a latent context startup failure |
| 2. Root GitHub Actions CI | Discoverable frontend/backend validation on PR and main events | Hosted Chrome or action configuration differs from local execution |

**Prerequisites:** GitHub Actions enabled for the repository and permission to push `DB-59`.
**Estimated effort:** One short implementation session across two phases, plus waiting for hosted workflow runs.

## Open Risks & Assumptions

- GitHub-hosted `ubuntu-latest` provides a Chrome binary compatible with the existing `ChromeHeadless` launcher.
- Official action major versions require a current GitHub-hosted runner, which the repository uses.
- Existing frontend lint debt remains visible in research but is not silently treated as passing.
- The post-merge push run can only be confirmed after the pull request is merged.

## Success Criteria (Summary)

- GitHub shows separate passing `frontend` and `backend` jobs on the pull request.
- Frontend tests/build and all 37 backend tests pass in hosted CI.
- A merge to `main` triggers CI, with no deployment or external service configuration.
