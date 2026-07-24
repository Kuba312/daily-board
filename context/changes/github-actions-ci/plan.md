# GitHub Actions CI Implementation Plan

## Overview

Add a repository-root GitHub Actions workflow that validates the Angular frontend and Spring Boot backend on pull requests to `main` and pushes to `main`. The workflow will provide CI only: deployment and release automation remain explicitly out of scope.

The change also corrects the existing Spring context test name so Maven Surefire discovers it under the project's current `*Test.java` convention.

## Current State Analysis

The repository has no active GitHub Actions workflow. The existing workflow is nested at `frontend/.github/workflows/ci-cd-pipeline.yml`, which GitHub does not discover. It also uses an unsupported Node 18 image, runs npm commands from the wrong directory, bypasses the lockfile, covers only frontend push events, and contains obsolete Chrome installation logic.

The frontend has working unit-test and production-build commands, but full lint currently fails with 70 errors and 14 warnings. The backend uses Java 22, Maven Wrapper 3.9.7, and test-scoped H2; its current suite runs 36 tests. `DailyboardApplicationTests.java` is skipped because Surefire includes `*Test.java`, not `*Tests.java`.

## Desired End State

- GitHub discovers one workflow at `.github/workflows/ci.yml`.
- Pull requests targeting `main` and pushes to `main` run independent frontend and backend jobs.
- Frontend CI installs locked dependencies with Node 22, runs the headless unit suite, and performs the production build.
- Backend CI uses Temurin Java 22 and Maven Wrapper to run 37 tests, including the Spring context test.
- The obsolete nested workflow no longer exists.
- No deploy, environment, secret, MySQL service, Docker, e2e, or release step is introduced.

### Key Discoveries

- GitHub only discovers workflows from repository-root `.github/workflows/`; the existing file is nested under `frontend/`.
- Angular 21 supports Node 22, while the old workflow's Node 18 image is incompatible.
- The production Angular build supplies strict TypeScript and template checking because no standalone typecheck script exists.
- Backend tests use H2 in MySQL compatibility mode and need no MySQL service or datasource secrets.
- `DailyboardApplicationTests.java` does not match the explicit Surefire include `**/*Test.java`.
- Current full frontend lint is not a viable required gate without a separate cleanup effort.

## What We're NOT Doing

- Deploying the application or configuring continuous delivery.
- Adding hosting, environments, release promotion, artifacts, or deployment secrets.
- Running Playwright e2e in CI.
- Adding a MySQL service container.
- Fixing the existing frontend lint baseline or adding lint as a required gate.
- Adding dependency audits, CodeQL, Dependabot, or other security automation.
- Generating or publishing JaCoCo reports.
- Changing backend persistence behavior or replacing H2 with MySQL in tests.
- Changing application functionality.

## Implementation Approach

Keep the change in two small phases. First, align the Spring context test with the existing Surefire naming contract and establish a 37-test backend baseline. Second, replace the inactive nested workflow with one root workflow containing parallel frontend and backend jobs.

Use maintained official GitHub actions, read-only repository permissions, explicit module working directories, and dependency caches keyed from each module's committed dependency definition. Keep commands aligned with local developer commands so CI failures are reproducible outside GitHub.

## Critical Implementation Details

The workflow must not copy the old container-based Chrome setup. The Ubuntu GitHub-hosted job should run the existing `ChromeHeadless` launcher directly; `ChromeHeadlessNoSandbox` is not configured in this repository.

The frontend lint command must stay out of the required workflow in this change because it fails before any CI regression is introduced. The workflow should be green when first added.

## Phase 1: Restore Spring Context Test Discovery

### Overview

Rename the existing Spring context smoke test to match the project's explicit Maven Surefire include pattern, then establish the updated backend test baseline before adding CI.

### Changes Required

#### 1. Spring context test

**File**: `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/DailyboardApplicationTests.java`

**Intent**: Replace the plural `Tests` filename and class name with the singular `Test` form so the current Surefire configuration discovers the test.

**Contract**: Move the file to `DailyboardApplicationTest.java` and rename the package-private class to `DailyboardApplicationTest`. Preserve `@SpringBootTest` and the existing `contextLoads()` behavior.

### Success Criteria

#### Automated Verification

- The old `DailyboardApplicationTests.java` path is absent and `DailyboardApplicationTest.java` exists.
- Backend tests pass with 37 tests and zero failures/errors: `cd backend/dailyboard-backend && ./mvnw --batch-mode --no-transfer-progress test`.

#### Manual Verification

- Review the Maven output and confirm `DailyboardApplicationTest` is listed as an executed test class.

**Implementation Note**: After completing this phase and all automated verification passes, pause for confirmation that the Maven output includes the renamed context test before proceeding.

---

## Phase 2: Add Repository-Root GitHub Actions CI

### Overview

Replace the inactive frontend-only workflow with a discoverable root workflow that runs frontend and backend validation independently on the agreed GitHub events.

### Changes Required

#### 1. Obsolete nested workflow

**File**: `frontend/.github/workflows/ci-cd-pipeline.yml`

**Intent**: Remove the undiscoverable and obsolete workflow so the repository has one authoritative CI definition.

**Contract**: Delete the nested workflow file; do not retain a second workflow under `frontend/`.

#### 2. Root CI workflow

**File**: `.github/workflows/ci.yml`

**Intent**: Add the repository's active CI contract for frontend and backend validation.

**Contract**:

- Name the workflow `CI`.
- Trigger on pull requests targeting `main` and pushes to `main`.
- Set workflow permissions to `contents: read`.
- Define independent `frontend` and `backend` jobs on `ubuntu-latest`; neither job depends on the other.
- Use `actions/checkout@v6`.
- Frontend uses `actions/setup-node@v6` with Node 22, npm caching keyed from `frontend/package-lock.json`, and `frontend/` as the working directory.
- Frontend runs `npm ci`, `npm test -- --watch=false --browsers=ChromeHeadless`, and `npm run build`.
- Backend uses `actions/setup-java@v5` with Temurin Java 22, Maven caching keyed from `backend/dailyboard-backend/pom.xml`, and `backend/dailyboard-backend/` as the working directory.
- Backend runs `./mvnw --batch-mode --no-transfer-progress test`.
- Do not add lint, e2e, MySQL, deployment, secrets, artifact upload, or release steps.

### Success Criteria

#### Automated Verification

- The workflow YAML parses without syntax errors.
- `git diff --check` passes.
- Frontend unit tests pass locally: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`.
- Frontend production build passes locally: `cd frontend && npm run build`.
- Backend tests still pass with 37 tests: `cd backend/dailyboard-backend && ./mvnw --batch-mode --no-transfer-progress test`.
- Repository search finds one project workflow under root `.github/workflows/` and no workflow under `frontend/.github/workflows/`.

#### Manual Verification

- After pushing `DB-59` and opening or updating its pull request to `main`, GitHub Actions shows separate `frontend` and `backend` jobs.
- Both jobs complete successfully without repository secrets or a MySQL service.
- After merge, a push-triggered workflow run appears on `main`.

**Implementation Note**: Local verification cannot prove GitHub event discovery or hosted-runner behavior. Pause after pushing the implementation until the pull-request run is visible and both jobs are green.

---

## Testing Strategy

### Unit Tests

- Run the complete Angular Karma/Jasmine suite in ChromeHeadless.
- Run the complete Maven Surefire suite and verify the context smoke test raises the count from 36 to 37.

### Integration Tests

- Treat the Spring Boot `@SpringBootTest` and MockMvc/H2 tests as the backend integration signal.
- Do not introduce Playwright or MySQL integration coverage in this change.

### Manual Testing Steps

1. Push the implementation branch and open or update a pull request targeting `main`.
2. Confirm GitHub discovers a workflow named `CI`.
3. Confirm the `frontend` and `backend` jobs start independently.
4. Inspect both job logs for the expected Node 22 and Java 22 setup.
5. Confirm both jobs pass without configured secrets or service containers.
6. After merge, confirm the push-to-`main` event starts another CI run.

## Performance Considerations

Frontend and backend jobs run in parallel to minimize feedback time. npm and Maven dependency caches reduce repeated downloads. The workflow avoids duplicate feature-branch push runs after a pull request is opened by limiting push triggers to `main`.

## Migration Notes

There is no data or application migration. Removing the nested workflow is safe because GitHub does not discover it at that path. Rollback consists of reverting the root workflow commit and the test rename.

## References

- Related research: `context/changes/github-actions-ci/research.md`
- Existing workflow: `frontend/.github/workflows/ci-cd-pipeline.yml`
- Frontend scripts: `frontend/package.json`
- Frontend test/build configuration: `frontend/angular.json`
- Backend build configuration: `backend/dailyboard-backend/pom.xml`
- Backend test datasource: `backend/dailyboard-backend/src/test/resources/application.yml`
- GitHub checkout action: https://github.com/actions/checkout
- GitHub setup-node action: https://github.com/actions/setup-node
- GitHub setup-java action: https://github.com/actions/setup-java

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Restore Spring Context Test Discovery

#### Automated

- [x] 1.1 The context test uses the Surefire-compatible singular file and class name — 606e97f
- [x] 1.2 Backend tests pass with 37 tests and zero failures/errors — 606e97f

#### Manual

- [x] 1.3 Maven output confirms DailyboardApplicationTest executed — 606e97f

### Phase 2: Add Repository-Root GitHub Actions CI

#### Automated

- [x] 2.1 Workflow YAML parses without syntax errors — b84c248
- [x] 2.2 Git diff validation passes — b84c248
- [x] 2.3 Frontend unit tests pass in ChromeHeadless — b84c248
- [x] 2.4 Frontend production build passes — b84c248
- [x] 2.5 Backend tests pass with 37 tests — b84c248
- [x] 2.6 Only the repository-root project workflow remains — b84c248

#### Manual

- [x] 2.7 Pull request run exposes separate frontend and backend jobs — e5d8f85
- [x] 2.8 Both hosted-runner jobs pass without secrets or MySQL — e5d8f85
- [x] 2.9 Push to main starts the CI workflow after merge — fe4ce4d
