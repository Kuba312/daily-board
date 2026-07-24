<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: GitHub Actions CI Implementation Plan

- **Plan**: `context/changes/github-actions-ci/plan.md`
- **Scope**: Phases 1-2 of 2
- **Date**: 2026-07-24
- **Verdict**: APPROVED
- **Findings**: 0 critical, 2 warnings, 0 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 - GitHub Actions use mutable major-version tags

- **Severity**: WARNING
- **Impact**: MEDIUM - real tradeoff; pause to reason through it
- **Dimension**: Safety & Quality
- **Location**: `.github/workflows/ci.yml:23`
- **Detail**: `actions/checkout`, `actions/setup-node`, and `actions/setup-java` use mutable major-version tags. Read-only permissions and the absence of secrets limit the impact, but full commit SHAs are the immutable reference form.
- **Fix**: Pin each action to a verified full commit SHA and configure Dependabot to update the references.
  - Strength: Reduces the workflow's third-party supply-chain exposure.
  - Tradeoff: Adds maintenance work and requires an update mechanism for pinned SHAs.
  - Confidence: HIGH - the workflow has only three official actions to maintain.
  - Blind spot: Repository-level GitHub security settings were not inspected.
- **Decision**: PENDING

### F2 - CI bypasses an existing peer dependency conflict

- **Severity**: WARNING
- **Impact**: HIGH - architectural stakes; think carefully before deciding
- **Dimension**: Safety & Quality
- **Location**: `.github/workflows/ci.yml:33`
- **Detail**: `npm ci --legacy-peer-deps` ignores peer dependency contracts. The committed graph contains `ng-dialog-animation@9.0.4`, which requires `tslib@^1.10.0`, while the application declares `tslib@^2.3.0`. The lockfile still makes installation deterministic, so this is a compatibility-quality concern rather than a reproducibility failure.
- **Fix**: Upgrade, replace, or remove the incompatible dependency, regenerate the lockfile with normal peer resolution, and return CI to plain `npm ci`.
  - Strength: Restores npm's dependency compatibility checks.
  - Tradeoff: The dialog dependency is used by the application, so replacement can affect runtime UI behavior and needs focused regression testing.
  - Confidence: HIGH - the peer conflict was reproduced by both local and hosted `npm ci`.
  - Blind spot: No replacement library or migration effort was evaluated in this review.
- **Decision**: PENDING

## Verification

- Workflow YAML parsed successfully.
- `git diff --check` passed.
- Angular tests passed: 298 of 298.
- Angular production build passed.
- Maven tests passed on Java 22: 37 tests, 0 failures, 0 errors.
- `DailyboardApplicationTest` was executed by Surefire.
- Only the repository-root project workflow remains.
- Pull-request and post-merge GitHub Actions runs exposed successful frontend and backend jobs.

