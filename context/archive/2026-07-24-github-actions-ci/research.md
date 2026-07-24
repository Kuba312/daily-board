---
date: 2026-07-24T19:20:12+02:00
researcher: Codex
git_commit: d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1
branch: DB-59
repository: daily-board
topic: "GitHub Actions CI for frontend and backend without deployment"
tags: [research, codebase, github-actions, angular, spring-boot]
status: complete
last_updated: 2026-07-24
last_updated_by: Codex
---

# Research: GitHub Actions CI for frontend and backend

**Date**: 2026-07-24T19:20:12+02:00
**Researcher**: Codex
**Git Commit**: d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1
**Branch**: DB-59
**Repository**: daily-board

## Research Question

What should a minimal, reliable GitHub Actions pipeline validate for the Daily Board frontend and backend when deployment is explicitly out of scope?

## Summary

The repository has no active GitHub Actions workflow. Its only workflow is nested under `frontend/.github/workflows/`, while GitHub discovers workflows only from the repository-root `.github/workflows/` directory. The nested workflow is also obsolete: it uses Node 18, installs dependencies from the wrong working directory, bypasses the lockfile, has no pull-request trigger, and validates no backend code.

The smallest useful CI is one root workflow with independent frontend and backend jobs:

- Frontend: Node 22, `npm ci`, headless unit tests, and production build.
- Backend: Java 22 and `./mvnw --batch-mode --no-transfer-progress test`.
- Triggers: pull requests targeting `main` and pushes to `main`.
- Explicit exclusions: deployment, e2e, MySQL service, Docker, release promotion, security scanning, and unrelated lint cleanup.

Frontend lint should not be a required gate in this change unless its existing baseline is addressed. A fresh `npm run lint` run reports 70 errors and 14 warnings across generated API files and existing application/test code. Adding it unchanged would make the new pipeline permanently red.

## Detailed Findings

### Workflow discovery and current pipeline

- The current workflow is located at [`frontend/.github/workflows/ci-cd-pipeline.yml`](https://github.com/Kuba312/daily-board/blob/d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1/frontend/.github/workflows/ci-cd-pipeline.yml#L1), so it is not discovered as a repository workflow.
- Git history shows that the workflow originally existed at repository root and was moved under `frontend/` during backend initialization.
- It triggers only for pushes to `main`, not pull requests ([workflow lines 3-6](https://github.com/Kuba312/daily-board/blob/d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1/frontend/.github/workflows/ci-cd-pipeline.yml#L3)).
- Its npm commands have no `frontend/` working directory ([workflow line 30](https://github.com/Kuba312/daily-board/blob/d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1/frontend/.github/workflows/ci-cd-pipeline.yml#L30)).
- It uses Node 18 and `actions/checkout@v2`, performs repeated system package installation, and uses `npm install --legacy-peer-deps` instead of the committed lockfile.
- The inactive nested workflow should be removed when the root workflow is introduced, to avoid two conflicting descriptions of CI.

### Frontend requirements

- The project uses npm and has a lockfile, so CI should install with `npm ci` ([`package-lock.json`](https://github.com/Kuba312/daily-board/blob/d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1/frontend/package-lock.json#L1)).
- Angular 21 requires a supported modern Node runtime; Node 22 satisfies the package engine constraints recorded in the lockfile.
- The available commands are `npm test`, `npm run lint`, and `npm run build` ([`package.json`](https://github.com/Kuba312/daily-board/blob/d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1/frontend/package.json#L4)).
- Unit tests use Angular's Karma/Jasmine builder and require a Chrome-compatible headless browser ([`angular.json`](https://github.com/Kuba312/daily-board/blob/d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1/frontend/angular.json#L76)).
- There is no standalone typecheck script. The production Angular build performs TypeScript and strict-template compilation; strict options are enabled in [`tsconfig.json`](https://github.com/Kuba312/daily-board/blob/d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1/frontend/tsconfig.json#L7).
- The current full lint baseline fails with 70 errors and 14 warnings. Most failures are pre-existing generated API comments, formatting rules, output naming rules, and test typing/naming rules.
- Playwright e2e should remain outside this first CI workflow. Its backend web-server command contains a macOS-specific Java lookup and is not portable to an Ubuntu runner ([`playwright.config.ts`](https://github.com/Kuba312/daily-board/blob/d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1/frontend/playwright.config.ts#L33)).

### Backend requirements

- The backend compiles for Java 22 ([`pom.xml`](https://github.com/Kuba312/daily-board/blob/d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1/backend/dailyboard-backend/pom.xml#L31)).
- The executable Maven Wrapper pins Maven 3.9.7, so CI does not need a separately managed Maven version ([`maven-wrapper.properties`](https://github.com/Kuba312/daily-board/blob/d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1/backend/dailyboard-backend/.mvn/wrapper/maven-wrapper.properties#L17)).
- Tests use test-scoped H2 with MySQL compatibility mode, so a MySQL service container and datasource secrets are unnecessary ([test `application.yml`](https://github.com/Kuba312/daily-board/blob/d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1/backend/dailyboard-backend/src/test/resources/application.yml#L1)).
- `./mvnw --batch-mode --no-transfer-progress test` completed with 36 tests and no failures or errors.
- Surefire includes `*Test.java` but not `*Tests.java`, so `DailyboardApplicationTests` is currently skipped. This is existing test-discovery debt, not a reason to block basic CI.
- H2 compatibility mode does not prove MySQL-specific behavior. This limitation already exists locally and should not expand the CI scope.

### Existing quality guidance

- The health check identifies backend CI and frontend lint as missing quality gates ([`health-check-v2.md`](https://github.com/Kuba312/daily-board/blob/d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1/context/foundation/health-check-v2.md#L46)).
- The test plan expects frontend build/tests and backend integration tests in CI ([`test-plan.md`](https://github.com/Kuba312/daily-board/blob/d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1/context/foundation/test-plan.md#L121)).
- Deployment remains parked in the roadmap ([`roadmap.md`](https://github.com/Kuba312/daily-board/blob/d5977cc48f94b2c14ecd10bd5511ff2c2622a0b1/context/foundation/roadmap.md#L133)) and is explicitly excluded from this change.

## Code References

- `frontend/.github/workflows/ci-cd-pipeline.yml:1` - inactive and obsolete nested workflow
- `frontend/package.json:4` - frontend scripts
- `frontend/package-lock.json:1` - deterministic npm dependency graph
- `frontend/angular.json:76` - Karma test builder and lint configuration
- `frontend/tsconfig.json:7` - strict TypeScript and template checks
- `frontend/playwright.config.ts:33` - macOS-specific backend command for e2e
- `backend/dailyboard-backend/pom.xml:31` - Java 22 and backend test dependencies/plugins
- `backend/dailyboard-backend/.mvn/wrapper/maven-wrapper.properties:17` - Maven 3.9.7 wrapper
- `backend/dailyboard-backend/src/test/resources/application.yml:1` - H2 test datasource
- `context/foundation/health-check-v2.md:46` - CI gaps
- `context/foundation/test-plan.md:121` - expected quality gates

## Architecture Insights

The repository is a two-module monorepo without a root package/build orchestrator. CI should therefore model frontend and backend as independent jobs with explicit working directories and independent dependency caches. Parallel jobs provide faster feedback and make failures attributable to one module.

The pipeline should validate the same commands developers can run locally. It should not introduce MySQL infrastructure when backend tests intentionally use H2, nor introduce e2e until the existing Playwright server startup is portable.

The first pipeline must be green at introduction. Existing lint debt should be made explicit rather than hidden, but wiring a known-failing command as a required check would provide no useful regression signal.

## Historical Context

- Commit `4be863a` originally created the frontend workflow at repository root.
- Commit `f1d5ff9` moved it under `frontend/` during repository restructuring, making it undiscoverable by GitHub Actions.
- `context/foundation/health-check-v2.md` records missing backend CI and lint coverage.
- `context/foundation/test-plan.md` treats build/tests as required CI quality gates.
- `context/foundation/infrastructure.md` excludes deployment pipelines from the current infrastructure scope.

## Related Research

- `context/archive/2026-06-01-testing-ownership-boundary-api-coverage/research.md`
- `context/archive/2026-06-08-owned-manual-planning-board/research.md`

## Open Questions

- Should lint cleanup be included in this change, or tracked separately so the initial CI can remain focused and green?
- Should pushes to feature branches run CI in addition to pull requests, accepting duplicate runs after a PR is opened?
- Should the skipped `DailyboardApplicationTests` naming/configuration issue be fixed separately?
- E2e CI remains a later improvement after the Playwright server startup is made cross-platform.
