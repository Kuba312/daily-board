# Owned Planning CRUD Minimum Implementation Plan

## Overview

Implement roadmap P-03: a logged-in user can update and delete their own planners and update/delete individual duties, while another user cannot mutate that data. Planner deletion removes dependent duties after explicit confirmation. Planner scheduling-shape changes are destructive: if start time, end time, or constant/dynamic mode changes and duties exist, the backend must require an explicit confirmation flag before deleting those duties in the update transaction.

This is a CRUD minimum slice. It keeps `Duty` as the current task/event abstraction, preserves existing board and dynamic week switching behavior, and does not introduce AI, shared planners, roles, refresh-token work, or board architecture changes.

## Current State Analysis

P-01 and P-02 already established authentication, planner ownership, owned duty creation/reads, and scoped board loading. The backend is the ownership source of truth: planner reads use `planner.id + currentUser.id`, and duty reads/creates resolve the selected planner through the current user before touching duties.

The missing P-03 surface is update/delete. Backend planner and duty controllers expose create/read only. Frontend NgRx actions/effects expose save/load only. Planner dashboard edit/delete buttons exist but are disabled. Planner and duty form models are create-oriented but can be made mode-aware. The generated frontend API client has no PUT/DELETE methods yet, and `frontend/package.json` already provides `npm run openapi-generate` against the Spring OpenAPI endpoint.

## Desired End State

After this plan is complete, User A can edit planner name/note without affecting duties, update planner scheduling shape only after explicitly confirming duty deletion, delete a planner with confirmation, edit one duty instance at a time, and delete a duty from the board tile with a lightweight confirmation. User B cannot update or delete User A planners or duties by direct API call, stale URL, or mismatched request body.

After successful planner update/delete or duty update/delete, local NgRx state updates immediately and fetches only the current route's needed data. If a planner shape change deletes duties, the board state is refreshed so removed duties disappear immediately. If a planner is deleted, the frontend navigates to the existing valid dashboard/empty-state flow. Dynamic week switching remains unchanged.

### Key Discoveries:

- `PlannerController` currently has only `POST /api/v1/planners`, `GET /api/v1/planners/all`, and `GET /api/v1/planners/{id}` at `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/PlannerController.java:29`.
- `PlannerService.getPlanner` already resolves by planner id and current user id at `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:30`.
- `DutyController` currently has create/read routes only at `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/DutyController.java:32`.
- `DutyService` already anchors duty operations to an owned planner through `getCurrentUserPlanner` at `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:92`.
- Planner-to-duty persistence already declares orphan removal in `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/model/dao/Planner.java:30` and the schema has `ON DELETE CASCADE` in `backend/dailyboard-backend/src/main/resources/db/migration/V1__init_tables.sql:20`.
- Planner dashboard edit/delete buttons exist but are disabled in `frontend/src/app/views/planners-dashboard/planners-dashboard.component.ts:52`.
- `PlannerFormModel` currently emits only create-shaped `PlannerDto` fields in `frontend/src/app/views/planner-form/planner-form.form-model.ts:41`.
- `TaskBoardFormComponent` dispatches create-only `saveDuty` with the route planner id at `frontend/src/app/views/task-board-form/task-board-form.component.ts:115`.
- Board tile rendering currently shows duty names only, with no edit/delete controls, in `frontend/src/app/shared/components/planner-board/planner-board-tile-duties/planner-board-tile-duties.component.html:10`.

## What We're NOT Doing

- No AI proposal, AI acceptance, or AI persistence behavior.
- No shared planners, roles, refresh-token flow, password/account work, or advanced permissions.
- No new `Task` or `Event` entities; `Duty` remains the task/event abstraction for this slice.
- No grouped duty editing and no recurring-rule semantics.
- No migration, clamping, partial preservation, or reinterpretation of duties after planner scheduling-shape changes.
- No soft delete.
- No board architecture rewrite and no change to dynamic week switching behavior.
- No visual polish beyond required edit/delete controls and confirmations.
- No direct `HttpClient` calls from effects and no handwritten frontend API shortcuts unless OpenAPI generation is impossible.
- No production deploy, CI workflow authoring, or broad state-management refactor.

## Implementation Approach

Add explicit backend mutation contracts first, with ownership checks and transaction semantics as the source of truth. Planner update uses `PUT /api/v1/planners/{id}` with a full planner update request shape and an explicit destructive confirmation flag. Duty update uses `PUT /api/v1/duties/{plannerId}/{dutyId}` with one `DutyDto`, so the selected planner remains part of the ownership boundary. Planner and duty deletes use DELETE routes that resolve by current user ownership before mutation.

After backend OpenAPI exposes the routes, regenerate the Angular API client using the existing `openapi-generate` script. Then wire minimal NgRx actions/effects/reducer handling and mode-aware UI routes/forms. Planner dashboard owns planner edit/delete entry points. Board duty tiles expose minimal edit/delete actions while keeping week switching and board layout logic intact.

## Critical Implementation Details

### State Sequencing

On planner shape update with confirmed duty deletion, update the planner entity and clear/remove current planner duties from the duty store before refetching only the current board range if the user remains on a board route. This prevents deleted duties from flashing or remaining visible after the backend transaction has removed them.

### Backend Transaction Rule

Planner update must be transactional. If `startTime`, `endTime`, or `isConstant` differs from the persisted planner and that planner has duties, the backend rejects the update unless `confirmDutyDeletionOnShapeChange` is true. When confirmation is true, delete dependent duties and save the planner in the same transaction. Name/note-only edits must not require the flag and must keep duties.

### Ownership And Body Mismatch Rule

Mutation URLs are authoritative. The backend must verify the URL planner belongs to the current user, the target duty belongs to that planner, and any `plannerId` in the duty body cannot move the duty across planners. Cross-user or mismatched resource access should preserve the existing non-leaking `404` ownership behavior.

## Phase 1: Backend Planner Mutation Contracts

### Overview

Add owner-scoped planner update/delete endpoints and enforce destructive shape-change confirmation in the backend transaction.

### Changes Required:

#### 1. Planner Update Request DTO

**File**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/model/dto/PlannerUpdateDto.java`

**Intent**: Represent the full planner update request, including explicit confirmation for destructive scheduling-shape changes.

**Contract**: Include the full planner fields currently carried by `PlannerDto` (`name`, `note`, `startTime`, `endTime`, `isConstant`) plus `confirmDutyDeletionOnShapeChange`. The response contract remains `PlannerDto`; no owner fields are exposed.

#### 2. Planner Controller Update/Delete Routes

**File**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/PlannerController.java`

**Intent**: Expose the minimum owned planner mutation API.

**Contract**: Add `PUT /api/v1/planners/{id}` returning `PlannerDto`, and `DELETE /api/v1/planners/{id}` returning no body. Both routes pass the path id to the service. Do not reuse `POST /api/v1/planners` for update.

#### 3. Planner Service Mutation Logic

**File**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java`

**Intent**: Resolve planner mutations through `planner.id + currentUser.id` and enforce destructive shape-change rules.

**Contract**: Add transactional `updatePlanner(id, updateDto)` and `deletePlanner(id)` methods. `updatePlanner` loads the owned planner, detects shape changes by comparing persisted `startTime`, `endTime`, and `isConstant`, checks whether duties exist, rejects missing/false confirmation when destructive deletion would occur, deletes duties when confirmed, and updates planner fields. `deletePlanner` loads the owned planner first and then deletes it. User B must receive the same non-leaking not-found behavior when targeting User A planner.

#### 4. Duty Repository Support For Planner Shape Changes

**File**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/repository/DutyRepository.java`

**Intent**: Support efficient duty existence checks and dependent deletion for owned planner updates.

**Contract**: Add repository methods needed by planner update, such as `existsByPlannerId(String plannerId)` and `deleteByPlannerId(String plannerId)`. Keep service-level ownership checks before these methods are called.

#### 5. Planner Ownership Mutation Tests

**File**: `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/PlannerOwnershipTest.java`

**Intent**: Prove planner update/delete cannot bypass ownership and destructive shape changes require explicit confirmation.

**Contract**: Add integration tests for owner name/note update preserving duties; owner shape update with duties and missing/false confirmation returning a clear conflict/validation response; owner shape update with confirmation deleting duties; owner planner delete deleting dependent duties; User B cannot update/delete User A planner; unauthenticated update/delete is rejected.

### Success Criteria:

#### Automated Verification:

- Backend tests pass: `cd backend/dailyboard-backend && ./mvnw test`
- Planner update OpenAPI docs expose `PUT /api/v1/planners/{id}`.
- Planner delete OpenAPI docs expose `DELETE /api/v1/planners/{id}`.

#### Manual Verification:

- User A can update planner name/note and existing duties remain.
- User A cannot change planner shape with existing duties until confirmation is sent.
- User A can confirm shape change and sees dependent duties removed.
- User B cannot update or delete User A planner by direct API call.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to the next phase.

---

## Phase 2: Backend Duty Mutation Contracts And Generated API

### Overview

Add owner-scoped duty update/delete endpoints, verify duty-to-planner ownership, and regenerate the frontend API client from OpenAPI.

### Changes Required:

#### 1. Duty Controller Update/Delete Routes

**File**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/DutyController.java`

**Intent**: Expose one-instance duty update and delete operations anchored to the selected planner.

**Contract**: Add `PUT /api/v1/duties/{plannerId}/{dutyId}` with one `@Valid DutyDto` request body returning `DutyDto`, and `DELETE /api/v1/duties/{plannerId}/{dutyId}` returning no body. Keep existing create/read routes unchanged.

#### 2. Duty Service Mutation Logic

**File**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java`

**Intent**: Enforce that the planner belongs to the current user, the duty belongs to that planner, and body data cannot move the duty across planners.

**Contract**: Add `update(plannerId, dutyId, duty)` and `delete(plannerId, dutyId)` service methods. Both first resolve the owned planner, then resolve the duty by id and planner id. Update overwrites/keeps the persisted planner relation from the URL-owned planner and ignores any mismatched body `plannerId`. Conflict detection for updates must exclude the duty being updated so unchanged time ranges do not conflict with themselves.

#### 3. Duty Repository Support

**File**: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/repository/DutyRepository.java`

**Intent**: Support planner-anchored duty lookup and self-excluding conflict checks.

**Contract**: Add lookup support such as `findByIdAndPlannerId(...)`. Preserve existing read methods. Account for the current repository id type mismatch carefully; do not widen the scope into a repository refactor unless required to compile safely.

#### 4. Duty Ownership Mutation Tests

**File**: `backend/dailyboard-backend/src/test/java/com/dailyboard/dailyboard/controller/DutyOwnershipTest.java`

**Intent**: Prove duty update/delete ownership boundaries and URL/body mismatch behavior.

**Contract**: Add integration tests for owner duty update; owner duty delete; User B cannot update/delete User A duty; duty cannot be updated through an owned planner URL if the duty belongs to another planner; body `plannerId` cannot move a duty across planners; unchanged update does not conflict with itself; real overlapping update still returns the existing conflict behavior.

#### 5. Frontend Generated API Regeneration

**Files**: `frontend/src/api/**`

**Intent**: Keep the Angular API layer aligned with Spring OpenAPI.

**Contract**: Run backend locally with the new OpenAPI docs available, then run `cd frontend && npm run openapi-generate`. Generated client should include planner update/delete and duty update/delete methods. If generation is impossible locally, stop and document the blocker instead of adding direct `HttpClient` calls in effects.

### Success Criteria:

#### Automated Verification:

- Backend tests pass: `cd backend/dailyboard-backend && ./mvnw test`
- Generated frontend API compiles after regeneration: `cd frontend && npm run build`
- Generated planner and duty controller services include the new update/delete operations.

#### Manual Verification:

- User A can update and delete an owned duty via API.
- User B cannot update or delete User A duty by direct API call.
- A mismatched body `plannerId` does not move a duty.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to the next phase.

---

## Phase 3: Frontend Planner Edit/Delete Flow

### Overview

Enable existing planner dashboard edit/delete controls, make planner form mode-aware, and update NgRx state minimally after planner mutations.

### Changes Required:

#### 1. Planner Actions And Reducer

**Files**:

- `frontend/src/app/shared-store/planner-store/planner.actions.ts`
- `frontend/src/app/shared-store/planner-store/planner.reducer.ts`

**Intent**: Add planner update/delete state transitions without refactoring the store shape.

**Contract**: Add update planner, update success/failure, delete planner, and delete success/failure actions. Reducer upserts the updated planner on update success, removes the deleted planner on delete success, and preserves existing reset/load behavior.

#### 2. Planner Effects

**File**: `frontend/src/app/shared-store/planner-store/planner.effects.ts`

**Intent**: Call generated update/delete API methods, preserve protected API recovery, and refresh only needed state.

**Contract**: Update effect calls generated `PUT /api/v1/planners/{id}`. Delete effect calls generated `DELETE /api/v1/planners/{id}`. Both preserve existing snackbar and `recoverFromProtectedApiRejection` style. Shape-change update success must coordinate with duty state so current board duties are removed/refetched when the backend deleted them. Planner delete success removes the planner locally and navigates to `/planners`.

#### 3. Planner Form Edit Mode

**Files**:

- `frontend/src/app/views/planner-form/planner-form.component.ts`
- `frontend/src/app/views/planner-form/planner-form.form-model.ts`
- `frontend/src/app/views/planner-form/planner-form.component.html`

**Intent**: Reuse the existing planner form for create and edit while keeping edit behavior explicit.

**Contract**: Add edit route support that loads the current planner, initializes form controls from existing planner values, and dispatches update instead of save. When start time, end time, or constant/dynamic mode differs from the original planner and the planner has duties or the current route cannot prove it has none, require explicit frontend confirmation and send `confirmDutyDeletionOnShapeChange: true` only after confirmation. Name/note-only edits do not send confirmation.

#### 4. Planner Routes And Dashboard Buttons

**Files**:

- `frontend/src/app/views/routes.ts`
- `frontend/src/app/views/planners-dashboard/planners-dashboard.component.ts`
- `frontend/src/app/views/planners-dashboard/planners-dashboard.component.html`

**Intent**: Enable planner edit/delete entry points already visible on planner cards.

**Contract**: Add a protected planner edit route such as `/planner-edit/:plannerId`. Enable the edit button to navigate there. Enable the delete button to open explicit confirmation and dispatch delete on confirmation. Keep dashboard selection behavior unchanged.

#### 5. Confirmation Dialog Support

**Files**:

- `frontend/src/app/shared/services/dialog/dialog.service.ts`
- `frontend/src/app/shared/components/infromation-dialog/infromation-dialog.component.ts`
- `frontend/src/app/shared/components/infromation-dialog/information-dialog.component.html`
- `frontend/src/app/shared/models/dialog-information-config.ts`
- `frontend/src/assets/i18n/en-GB.json`
- `frontend/src/assets/i18n/pl-PL.json`

**Intent**: Provide minimal reusable confirmation/dismissal behavior for destructive planner mutations.

**Contract**: Extend or add a minimal confirmation path that returns a boolean-like result to the caller. Do not redesign dialog styling. Add translation keys for planner delete and planner shape-change confirmation.

#### 6. Planner Frontend Tests

**Files**:

- `frontend/src/app/shared-store/planner-store/planner.reducer.spec.ts`
- `frontend/src/app/shared-store/planner-store/planner.effects.spec.ts`
- `frontend/src/app/views/planner-form/planner-form.component.spec.ts`
- `frontend/src/app/views/planners-dashboard/planners-dashboard.component.spec.ts`

**Intent**: Lock in planner update/delete state behavior and destructive confirmation UX.

**Contract**: Cover update success upsert, delete success remove, shape-change confirmation flag dispatch, name/note edit without confirmation flag, dashboard edit navigation, dashboard delete confirmation dispatch, and protected API rejection behavior for mutation failures.

### Success Criteria:

#### Automated Verification:

- Planner store tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared-store/planner-store/planner.reducer.spec.ts'`
- Planner effects tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared-store/planner-store/planner.effects.spec.ts'`
- Planner form tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/planner-form/planner-form.component.spec.ts'`
- Planner dashboard tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/planners-dashboard/planners-dashboard.component.spec.ts'`
- Frontend build passes: `cd frontend && npm run build`

#### Manual Verification:

- User can edit planner name/note and duties remain visible.
- User is explicitly warned before scheduling-shape update that deletes duties.
- Confirmed planner shape update removes duties from the board immediately.
- User can delete a planner after confirmation and lands on the dashboard/empty state.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to the next phase.

---

## Phase 4: Frontend Duty Edit/Delete Flow And Regression Checks

### Overview

Add one-duty edit/delete UI from board tiles, wire NgRx update/delete state, and verify dynamic week switching still behaves as before.

### Changes Required:

#### 1. Duty Actions And Reducer

**Files**:

- `frontend/src/app/shared-store/duty-store/duty.actions.ts`
- `frontend/src/app/shared-store/duty-store/duty.reducer.ts`

**Intent**: Add one-instance duty update/delete state transitions without changing the duty cache model.

**Contract**: Add update duty, update success/failure, delete duty, and delete success/failure actions. Update success upserts the returned duty. Delete success removes the duty by id. Preserve loaded planner/range cache behavior used by dynamic week switching.

#### 2. Duty Effects

**File**: `frontend/src/app/shared-store/duty-store/duty.effects.ts`

**Intent**: Call generated duty update/delete methods and refresh only the current route's needed data.

**Contract**: Update effect calls generated `PUT /api/v1/duties/{plannerId}/{dutyId}`. Delete effect calls generated `DELETE /api/v1/duties/{plannerId}/{dutyId}`. Both preserve protected API recovery and existing conflict error behavior where relevant. After deletion, remove the duty locally and avoid broad store reset. If the current dynamic week range needs refetching because of update date movement, fetch only the affected current range.

#### 3. Task Board Form Edit Mode

**Files**:

- `frontend/src/app/views/task-board-form/task-board-form.component.ts`
- `frontend/src/app/views/task-board-form/task-board-form.form-model.ts`
- `frontend/src/app/views/task-board-form/task-board-form.component.html`

**Intent**: Reuse the existing duty form to edit one existing duty instance.

**Contract**: Add route support that receives `plannerId` and `dutyId`, loads the planner and current duty from store/API-backed state, initializes the form from that duty, and dispatches update for one `DutyDto`. Do not introduce grouped duty editing. Do not add owner fields.

#### 4. Duty Board Tile Controls

**Files**:

- `frontend/src/app/shared/components/planner-board/planner-board-tile-duties/planner-board-tile-duties.component.ts`
- `frontend/src/app/shared/components/planner-board/planner-board-tile-duties/planner-board-tile-duties.component.html`
- `frontend/src/app/shared/components/planner-board/planner-board.component.ts`
- `frontend/src/app/shared/components/planner-board/planner-board.component.html`
- Parent wiring in `frontend/src/app/views/planner/planner.component.ts`

**Intent**: Allow minimal edit/delete actions where users see duties without redesigning the board.

**Contract**: Add small edit/delete action emitters for a duty tile. Edit navigates to the duty edit route. Delete opens lightweight confirmation and dispatches delete for the current planner and duty. Keep tile positioning, grouping, animation, and `changedWeekPeriod` behavior unchanged.

#### 5. Duty Routes

**File**: `frontend/src/app/views/routes.ts`

**Intent**: Add protected duty edit route while preserving the current add route.

**Contract**: Add a route such as `/task-board-edit/:plannerId/:dutyId` with the same planner/duty store providers and effects needed by the form. Keep `/task-board-add/:plannerId` unchanged.

#### 6. Duty Frontend Tests

**Files**:

- `frontend/src/app/shared-store/duty-store/duty.reducer.spec.ts`
- `frontend/src/app/shared-store/duty-store/duty.effects.spec.ts`
- `frontend/src/app/views/task-board-form/task-board-form.component.spec.ts`
- `frontend/src/app/views/planner/planner.component.spec.ts`
- `frontend/src/app/shared/components/planner-board/planner-board-tile-duties/planner-board-tile-duties.component.spec.ts`

**Intent**: Cover duty update/delete state behavior, one-instance edit mode, board tile actions, and week-switching regression.

**Contract**: Cover update success upsert, delete success remove, generated API method calls with `plannerId` and `dutyId`, edit form dispatching one duty, delete confirmation dispatch from a board tile, and existing dynamic week switching fetch/no-fetch behavior. Do not change week switching expectations except where test names are currently misleading.

### Success Criteria:

#### Automated Verification:

- Duty store tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared-store/duty-store/duty.reducer.spec.ts'`
- Duty effects tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared-store/duty-store/duty.effects.spec.ts'`
- Task board form tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/task-board-form/task-board-form.component.spec.ts'`
- Planner component tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/views/planner/planner.component.spec.ts'`
- Board tile tests pass: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='src/app/shared/components/planner-board/planner-board-tile-duties/planner-board-tile-duties.component.spec.ts'`
- Frontend build passes: `cd frontend && npm run build`

#### Manual Verification:

- User can edit one duty instance from the board and see the changed duty on the correct board/week.
- User can delete one duty from the board after confirmation and it disappears immediately.
- Dynamic planner week switching still fetches unloaded ranges and does not duplicate fetch already-loaded ranges.
- User B cannot update/delete User A duty through UI or direct URL/API path.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation.

---

## Testing Strategy

### Unit Tests:

- Backend planner ownership mutation tests for update/delete, cross-user denial, destructive shape-change confirmation, and dependent duty deletion.
- Backend duty ownership mutation tests for update/delete, cross-user denial, body/url mismatch, self-excluding conflict checks, and real conflict preservation.
- Frontend reducers for planner and duty update/delete state transitions.
- Frontend effects for generated API calls, protected API recovery, success snackbars/navigation, and local state refresh.
- Planner form edit-mode tests for prefill, name/note update, shape-change confirmation, and update dispatch payload.
- Task board form edit-mode tests for one-duty update payload and route id usage.
- Board tile tests for edit/delete emitters and delete confirmation dispatch.

### Integration Tests:

- Existing Spring `@SpringBootTest`/MockMvc style should cover backend mutation contracts end-to-end with real auth tokens.
- No new e2e framework setup in this slice.

### Manual Testing Steps:

1. Register/login as User A and create or reuse an owned planner with duties.
2. Edit planner name/note and verify duties remain.
3. Attempt planner start/end/mode change with duties and verify frontend asks for confirmation.
4. Confirm planner shape change and verify duties are deleted and disappear from the board.
5. Delete a planner after confirmation and verify navigation returns to the dashboard/empty state.
6. Create or use a duty, edit one instance from the board, and verify the changed duty appears.
7. Delete one duty from the board after confirmation and verify it disappears.
8. Log in as User B and verify direct API/UI attempts cannot update/delete User A planner or duty.
9. On a dynamic planner, switch weeks before and after duty mutations and verify existing week switching behavior remains intact.

## Performance Considerations

This slice is small-data MVP CRUD. Planner shape updates may delete all duties for one planner, but the roadmap assumes development/small data volume. Avoid broad frontend store resets where a local upsert/remove plus targeted current-route fetch is enough. Dynamic week range cache behavior should remain intact.

## Migration Notes

No database migration is planned unless implementation discovers the existing cascade/orphan-removal behavior is insufficient for reliable planner deletion. If a migration becomes necessary, it must be narrowly scoped to preserving the planner-to-duty delete contract and must not introduce soft delete.

## References

- PRD scope and guardrails: `context/foundation/prd.md`
- Roadmap P-03: `context/foundation/roadmap.md`
- Prior ownership research: `context/archive/2026-06-08-owned-manual-planning-board/research.md`
- Prior backend ownership coverage research: `context/archive/2026-06-01-testing-ownership-boundary-api-coverage/research.md`
- Planner controller create/read baseline: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/PlannerController.java:29`
- Planner service owner-scoped lookup: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/PlannerService.java:30`
- Duty controller create/read baseline: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/controller/DutyController.java:32`
- Duty service owned planner guard: `backend/dailyboard-backend/src/main/java/com/dailyboard/dailyboard/service/DutyService.java:92`
- Planner dashboard disabled edit/delete controls: `frontend/src/app/views/planners-dashboard/planners-dashboard.component.ts:52`
- Planner form model create baseline: `frontend/src/app/views/planner-form/planner-form.form-model.ts:41`
- Duty form create dispatch baseline: `frontend/src/app/views/task-board-form/task-board-form.component.ts:115`
- Board tile display baseline: `frontend/src/app/shared/components/planner-board/planner-board-tile-duties/planner-board-tile-duties.component.html:10`
- OpenAPI generation script: `frontend/package.json:12`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Backend Planner Mutation Contracts

#### Automated

- [x] 1.1 Backend tests pass — b0b7871
- [x] 1.2 Planner update OpenAPI docs expose PUT route — b0b7871
- [x] 1.3 Planner delete OpenAPI docs expose DELETE route — b0b7871

#### Manual

- [ ] 1.4 User A can update planner name/note and existing duties remain
- [ ] 1.5 User A cannot change planner shape with existing duties until confirmation is sent
- [ ] 1.6 User A can confirm shape change and sees dependent duties removed
- [ ] 1.7 User B cannot update or delete User A planner by direct API call

### Phase 2: Backend Duty Mutation Contracts And Generated API

#### Automated

- [x] 2.1 Backend tests pass — 8a38f2f
- [x] 2.2 Generated frontend API compiles after regeneration — 8a38f2f
- [x] 2.3 Generated planner and duty controller services include the new update/delete operations — 8a38f2f

#### Manual

- [ ] 2.4 User A can update and delete an owned duty via API
- [ ] 2.5 User B cannot update or delete User A duty by direct API call
- [ ] 2.6 A mismatched body plannerId does not move a duty

### Phase 3: Frontend Planner Edit/Delete Flow

#### Automated

- [x] 3.1 Planner store tests pass — 9dd8717
- [x] 3.2 Planner effects tests pass — 9dd8717
- [x] 3.3 Planner form tests pass — 9dd8717
- [x] 3.4 Planner dashboard tests pass — 9dd8717
- [x] 3.5 Frontend build passes — 9dd8717

#### Manual

- [ ] 3.6 User can edit planner name/note and duties remain visible
- [ ] 3.7 User is explicitly warned before scheduling-shape update that deletes duties
- [ ] 3.8 Confirmed planner shape update removes duties from the board immediately
- [ ] 3.9 User can delete a planner after confirmation and lands on the dashboard/empty state

### Phase 4: Frontend Duty Edit/Delete Flow And Regression Checks

#### Automated

- [ ] 4.1 Duty store tests pass
- [ ] 4.2 Duty effects tests pass
- [ ] 4.3 Task board form tests pass
- [ ] 4.4 Planner component tests pass
- [ ] 4.5 Board tile tests pass
- [ ] 4.6 Frontend build passes

#### Manual

- [ ] 4.7 User can edit one duty instance from the board and see the changed duty on the correct board/week
- [ ] 4.8 User can delete one duty from the board after confirmation and it disappears immediately
- [ ] 4.9 Dynamic planner week switching still fetches unloaded ranges and does not duplicate fetch already-loaded ranges
- [ ] 4.10 User B cannot update/delete User A duty through UI or direct URL/API path
