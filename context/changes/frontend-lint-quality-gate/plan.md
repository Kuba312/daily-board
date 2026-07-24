# Frontend Lint Quality Gate Implementation Plan

## Overview

Establish a clean, durable frontend lint baseline and make lint a required
step of the repository's existing frontend CI job. Generated OpenAPI client
files will be excluded from ESLint as generator-owned output, while all
authored TypeScript and Angular templates remain under the current strict
rules.

The implementation is split into four phases so mechanical autofixes are
reviewed separately from the Angular output-contract renames, and the CI gate
is enabled only after the local command is green.

## Current State Analysis

`cd frontend && npm run lint` currently reports 70 errors and 14 warnings.
Thirty errors and ten warnings come exclusively from the headers of the 30
files under `frontend/src/api/**`, which are overwritten by
`ng-openapi-gen`. After excluding that generated subtree, authored code has
40 errors and four warnings.

Of the authored errors, 26 are autofixable: 25 missing trailing commas and one
mapped index signature. The remaining errors are eight missing return types in
effect specs, three dynamic fixture keys, and three Angular output
declarations prefixed with `on`. Four inferred fields in the planner form
produce the remaining warnings.

The root workflow already runs frontend tests and build plus backend tests, but
does not run lint. Its frontend job has the correct Node version, npm cache,
working directory, and dependency installation, so lint needs one additional
step rather than a separate job.

## Desired End State

- `cd frontend && npm run lint` exits successfully with zero current errors
  and zero current warnings.
- Future lint errors fail the frontend CI job; future warnings remain visible
  but nonblocking under the existing ESLint severity policy.
- `frontend/src/api/**` is globally excluded from ESLint and remains untouched
  by cleanup work.
- Angular output contracts use `chipRemoved` and `plannerAnimationEnd` across
  declarations, emissions, and bindings without changing behavior.
- Frontend tests and the production build pass, including strict Angular
  template compilation.
- `.github/workflows/ci.yml` runs lint after dependency installation and before
  tests/build.
- `AGENTS.md` accurately describes the repository-root frontend/backend CI.

### Key Discoveries

- `frontend/openapi-config.json:2-5` and `frontend/package.json:12` establish
  `src/api/` as generator-owned output; generated files explicitly say
  `DO NOT EDIT`.
- `frontend/eslint.config.js:6-15` is a flat config, so a first standalone
  `ignores` object creates a global boundary without narrowing Angular CLI's
  authored-source patterns.
- `frontend/angular.json:95-99` should remain unchanged; its broad patterns
  continue to cover all authored TypeScript and templates.
- The only behavior-adjacent lint cleanup is the output rename spanning
  component declarations and nested template bindings.
- `.github/workflows/ci.yml:32-39` already provides the correct fail-fast
  insertion point after `npm ci`.

## What We're NOT Doing

- Editing, formatting, or regenerating `frontend/src/api/**`.
- Adding custom `ng-openapi-gen` templates or post-generation mutations.
- Adding OpenAPI contract-drift checks; that remains a separate test-plan gate.
- Changing `frontend/angular.json`, package manifests, or the lockfile.
- Promoting warnings to errors or adding `--max-warnings=0`.
- Configuring GitHub branch protection or repository rulesets.
- Adding new component tests, e2e tests, or Playwright configuration.
- Changing the project-local post-edit hook.
- Changing backend code or running backend tests for this frontend-only delta.
- Editing `context/archive/**`, dated health checks, or frozen test-plan
  strategy sections.
- Refactoring unrelated formatting or application logic.

## Implementation Approach

First establish the generated-code boundary, record the expected authored
baseline, and apply ESLint's autofix only after that boundary is active. Then
resolve the low-risk manual typing and fixture findings. Rename output
contracts atomically and verify them with existing tests plus strict template
build. Finally, add the already-green lint command to CI and synchronize the
repository guidance.

Warnings keep their current nonblocking severity. The four existing warnings
are still removed so the change starts from a clean output, but the CI command
remains the same `npm run lint` developers use locally.

## Critical Implementation Details

The generated ignore must land before any autofix command; otherwise ESLint can
touch generator-owned output. Both output event chains must be renamed
atomically across declarations, emissions, and every binding: preserve the
separate `chipRemovedIndex` output and preserve the view handler method
`PlannerComponent.onPlannerAnimationEnd()`.

## Phase 1: Establish Generated Boundary and Apply Mechanical Autofix

### Overview

Separate generated OpenAPI output from authored lint scope, confirm the
expected first-party baseline, and apply only ESLint's deterministic fixes.

### Changes Required

#### 1. Global generated-source ignore

**File**: `frontend/eslint.config.js`

**Intent**: Make the ownership boundary for the generated OpenAPI client
explicit and durable for every ESLint invocation.

**Contract**: Add a first standalone flat-config object with global
`ignores: ['src/api/**']`. Keep the existing TypeScript and HTML config objects
and all rule severities unchanged.

#### 2. Mechanical authored-source cleanup

**Files**:

- `frontend/src/app/core/form-errors.consts.ts`
- `frontend/src/app/shared/components/chip-tag/chip-tag.component.ts`
- `frontend/src/app/shared/components/date-range-configurer/date-range-configurer.component.ts`
- `frontend/src/app/shared/components/date-time-picker/calendar-time-ranger/calendar-time-ranger.component.ts`
- `frontend/src/app/shared/components/date-time-picker/week-date-picker-input/week-date-picker-input.component.ts`
- `frontend/src/app/shared/components/form-color-picker/tile-color/tile-color.component.ts`
- `frontend/src/app/shared/components/form-input/form-input.component.ts`
- `frontend/src/app/shared/components/form-select/form-select.component.ts`
- `frontend/src/app/shared/components/form-textarea/form-textarea.component.ts`
- `frontend/src/app/shared/components/header-with-buttons/header-with-buttons.component.ts`
- `frontend/src/app/shared/components/header/header.component.ts`
- `frontend/src/app/shared/components/infromation-dialog/infromation-dialog.component.ts`
- `frontend/src/app/shared/components/planner-board/planner-board-days-headers/planner-board-days-headers.component.ts`
- `frontend/src/app/shared/components/planner-board/planner-board-tile-duties/planner-board-tile-duties.component.ts`
- `frontend/src/app/shared/components/planner-board/planner-board.component.ts`
- `frontend/src/app/shared/components/planner-board/timeline-board-slider/timeline-board-slider.component.ts`
- `frontend/src/app/shared/components/planner-card/planner-card.component.ts`
- `frontend/src/app/shared/components/planner-items-container/planner-items-container.component.ts`
- `frontend/src/app/shared/components/primary-button/primary-button.component.ts`
- `frontend/src/app/shared/components/sub-section/sub-section.component.ts`
- `frontend/src/app/views/planner-form/planner-form.component.ts`
- `frontend/src/app/views/planner/planner.component.ts`
- `frontend/src/app/views/planners-dashboard/planners-dashboard.component.ts`
- `frontend/src/app/views/task-board-form/chip-tags-container/chip-tags-container.component.ts`
- `frontend/src/app/views/task-board-form/task-input-date/task-input-date.component.ts`
- `frontend/src/app/views/task-planner-chooser/task-planner-chooser.component.ts`

**Intent**: Remove the 26 deterministic first-party findings before any
semantic cleanup, keeping the diff mechanically reviewable.

**Contract**: Run the canonical lint autofix only after the generated ignore is
active. Accept the 25 trailing-comma fixes and the mapped-signature conversion
to `Record<ValidatorNames, string>`; do not accept unrelated rewrites.

### Success Criteria

#### Automated Verification

- A full lint run after adding the ignore reports the expected authored
  baseline of 40 errors and four warnings, with no `src/api/**` findings.
- Autofix completes against authored sources and the next lint run reports
  exactly 14 errors and four warnings.
- `git diff -- frontend/src/api` is empty and `git diff --check` passes.

#### Manual Verification

- Review the autofix diff and confirm it contains only trailing commas, the
  `Record<ValidatorNames, string>` conversion, and the ESLint ignore.

**Implementation Note**: Pause after this phase so the mechanical diff can be
reviewed before manual typing or Angular contract changes begin.

---

## Phase 2: Resolve Manual Typing, Fixture, and Warning Findings

### Overview

Remove the low-risk manual lint findings without changing runtime behavior or
test intent.

### Changes Required

#### 1. Effect-spec helper return types

**Files**:

- `frontend/src/app/shared-store/duty-store/duty.effects.spec.ts`
- `frontend/src/app/shared-store/planner-store/planner.effects.spec.ts`

**Intent**: Give the eight local effect factories explicit return types while
keeping their types coupled to the production factories they invoke.

**Contract**: Annotate each helper with
`ReturnType<typeof <production effect factory>>`. Do not reference the local
helper itself and do not duplicate the underlying Observable type.

#### 2. Dynamic planner fixture keys

**File**: `frontend/src/app/shared-store/duty-store/duty.reducer.spec.ts`

**Intent**: Represent planner IDs as runtime keys without weakening the naming
convention rule or changing expected reducer state.

**Contract**: Introduce a camelCase `plannerId` fixture value and use computed
properties for the three dynamic-key expectations. Keep related action inputs
coupled to the same fixture where doing so improves consistency.

#### 3. Planner-form field annotations

**File**: `frontend/src/app/views/planner-form/planner-form.component.ts`

**Intent**: Remove the four current `typedef` warnings while retaining their
nonblocking global severity.

**Contract**: Type `BACK_URL` as `string`, both initialization flags as
`boolean`, and `_planner` as `Signal<PlannerDto | undefined>`, adding the
Angular `Signal` import. Preserve the selector/fallback behavior.

### Success Criteria

#### Automated Verification

- Lint reports only the three known output-prefix errors and zero warnings.
- The full frontend test suite passes with
  `npm test -- --watch=false --browsers=ChromeHeadless`.
- `git diff --check` passes.

#### Manual Verification

- Review the helper annotations and reducer fixtures to confirm they preserve
  test behavior and do not mirror or alter production implementation.

**Implementation Note**: Keep this phase free of output renames so its typing
and fixture changes can be reviewed independently.

---

## Phase 3: Rename Angular Output Contracts Atomically

### Overview

Remove the three output-prefix violations while preserving chip removal and
planner animation behavior across nested component boundaries.

### Changes Required

#### 1. Chip removal event chain

**Files**:

- `frontend/src/app/shared/components/chip-tag/chip-tag.component.ts`
- `frontend/src/app/shared/components/chip-tag/chip-tag.component.html`
- `frontend/src/app/views/task-board-form/chip-tags-container/chip-tags-container.component.html`

**Intent**: Rename the leaf output to follow Angular's event naming guidance
without changing the event payload.

**Contract**: Rename `onChipRemoved` to `chipRemoved` in the declaration,
emission, and parent binding. Preserve the container's separate
`chipRemovedIndex` output and its upstream consumer.

#### 2. Planner animation event chain

**Files**:

- `frontend/src/app/shared/components/planner-board/planner-board-tile-duties/planner-board-tile-duties.component.ts`
- `frontend/src/app/shared/components/planner-board/planner-board-tile-duties/planner-board-tile-duties.component.html`
- `frontend/src/app/shared/components/planner-board/planner-board.component.ts`
- `frontend/src/app/shared/components/planner-board/planner-board.component.html`
- `frontend/src/app/views/planner/planner.component.html`

**Intent**: Rename both nested output declarations and their bindings while
preserving animation completion and dynamic week switching.

**Contract**: Rename output contracts from `onPlannerAnimationEnd` to
`plannerAnimationEnd` at the tile and board levels, including native animation
emission, board re-emission, and outer binding. Keep the view handler method
`PlannerComponent.onPlannerAnimationEnd()` unchanged.

### Success Criteria

#### Automated Verification

- Repository search confirms the old names are absent from output
  declarations, emissions, and bindings, while the view handler remains.
- `npm run lint` passes with zero errors and zero warnings.
- The full frontend test suite passes with
  `npm test -- --watch=false --browsers=ChromeHeadless`.
- The production frontend build passes with `npm run build`.
- `git diff -- frontend/src/api` is empty and `git diff --check` passes.

#### Manual Verification

- Removing a date chip still emits the correct index through
  `chipRemovedIndex`.
- Switching dynamic planner weeks still animates, clears the animation state,
  and allows subsequent week switches.

**Implementation Note**: Pause after automated verification for the manual
chip and dynamic-week smoke checks before enabling lint in CI.

---

## Phase 4: Enable the CI Gate and Synchronize Repository Guidance

### Overview

Make the now-green lint command part of the frontend CI contract and update
agent guidance to describe the current root workflow.

### Changes Required

#### 1. Frontend CI lint step

**File**: `.github/workflows/ci.yml`

**Intent**: Fail the frontend job early on authored-source lint errors without
duplicating dependency installation.

**Contract**: Add a `Run frontend lint` step executing plain `npm run lint`
immediately after frontend dependency installation and before frontend tests
and build. Do not add `--max-warnings=0`, a new job, or branch-protection
configuration.

#### 2. CI guidance

**File**: `AGENTS.md`

**Intent**: Remove stale guidance that describes an obsolete nested
frontend-only workflow and missing backend CI.

**Contract**: Update only the `## CI/CD` section to identify
`.github/workflows/ci.yml`, the frontend lint/test/build steps, and backend
Maven tests.

### Success Criteria

#### Automated Verification

- The workflow contains one frontend lint step after install and before
  frontend tests/build.
- `AGENTS.md` accurately names the root workflow and both job responsibilities.
- `npm run lint` passes locally with zero errors and zero warnings.
- The full frontend test suite passes with
  `npm test -- --watch=false --browsers=ChromeHeadless`.
- The production frontend build passes with `npm run build`.
- `git diff --check` passes and `git diff -- frontend/src/api` remains empty.

#### Manual Verification

- After pushing or updating the pull request, the hosted frontend job runs
  `Run frontend lint` before tests/build and completes successfully.

**Implementation Note**: Branch protection remains outside this plan; the
hosted check proves workflow execution, not repository ruleset enforcement.

---

## Testing Strategy

### Unit Tests

- Do not add tests solely for lint-driven renames.
- Run the existing full Karma/Jasmine suite after the manual typing cleanup,
  after output renames, and once more with the final CI/doc delta.
- Existing specs protect reducer/effect behavior; Angular component
  compilation exercises the affected component templates.

### Integration Tests

- Treat the production Angular build as the strict template and TypeScript
  integration check for renamed outputs and imported generated-client types.
- Do not add backend, Playwright, or OpenAPI regeneration coverage in this
  change.

### Manual Testing Steps

1. Open the task date form, add at least two date chips, remove one, and
   confirm the correct chip is removed.
2. Open a dynamic planner board and switch to another week.
3. Confirm the board animation completes and another week switch is accepted.
4. Confirm board/week data and navigation behavior are unchanged.
5. After push, inspect the frontend GitHub Actions job and confirm lint runs
   before tests/build.

## Performance Considerations

Lint adds one command to the existing frontend job but reuses the same checkout,
Node setup, dependency cache, and `npm ci`. Running it before tests/build gives
fast failure without adding a second job or installation. Excluding generated
output removes low-signal work from every lint invocation.

## Migration Notes

There is no data, API, or deployment migration. The generated ignore and CI
step can be reverted independently. If output renames must be rolled back,
revert each complete declaration/emission/binding chain atomically; never
revert only one template level.

## References

- Related research:
  `context/changes/frontend-lint-quality-gate/research.md`
- Existing lint configuration: `frontend/eslint.config.js:6-242`
- Angular lint target: `frontend/angular.json:95-99`
- Generated client configuration: `frontend/openapi-config.json:2-5`
- Existing frontend CI job: `.github/workflows/ci.yml:15-39`
- Scoped post-edit lint: `.codex/hooks/post-edit-validation.py:88-105`
- Prior CI decision:
  `context/archive/2026-07-24-github-actions-ci/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Establish Generated Boundary and Apply Mechanical Autofix

#### Automated

- [x] 1.1 Generated API ignore leaves an authored baseline of 40 errors and four warnings — d259ad4
- [x] 1.2 Authored-source autofix leaves exactly 14 errors and four warnings — d259ad4
- [x] 1.3 Generated API diff is empty and whitespace validation passes — d259ad4

#### Manual

- [x] 1.4 Autofix diff contains only the approved mechanical changes — d259ad4

### Phase 2: Resolve Manual Typing, Fixture, and Warning Findings

#### Automated

- [x] 2.1 Effect helper return-type findings are resolved against production factory types — dc51df2
- [x] 2.2 Dynamic planner fixture keys preserve reducer expectations — dc51df2
- [x] 2.3 Lint leaves only three output-prefix errors and zero warnings — dc51df2
- [x] 2.4 Frontend tests pass after manual typing and fixture cleanup — dc51df2
- [x] 2.5 Whitespace validation passes — dc51df2

#### Manual

- [x] 2.6 Typing and fixture changes preserve test intent — dc51df2

### Phase 3: Rename Angular Output Contracts Atomically

#### Automated

- [x] 3.1 Old output names are absent from declarations, emissions, and bindings — 7846e69
- [x] 3.2 Frontend lint passes with zero errors and zero warnings — 7846e69
- [x] 3.3 Frontend tests pass after output renames — 7846e69
- [x] 3.4 Frontend production build passes after output renames — 7846e69
- [x] 3.5 Generated API diff is empty and whitespace validation passes — 7846e69

#### Manual

- [x] 3.6 Date-chip removal still propagates the correct index — 7846e69
- [x] 3.7 Dynamic week animation completes and subsequent switching remains available — 7846e69

### Phase 4: Enable the CI Gate and Synchronize Repository Guidance

#### Automated

- [x] 4.1 Frontend CI runs lint after install and before tests and build — ea5f3f7
- [x] 4.2 Repository guidance accurately describes the root frontend and backend CI — ea5f3f7
- [x] 4.3 Final frontend lint passes with zero errors and zero warnings — ea5f3f7
- [x] 4.4 Final frontend tests pass — ea5f3f7
- [x] 4.5 Final frontend production build passes — ea5f3f7
- [x] 4.6 Final diff validation passes and generated API remains untouched — ea5f3f7

#### Manual

- [x] 4.7 Hosted frontend CI runs the lint step in the required order and passes — ea5f3f7
