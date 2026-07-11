import { DutyDto } from 'src/api/models';
import { dutyActions } from './duty.actions';
import { dutyReducer, selectAll } from './duty.reducer';
import { PlannerType } from '@shared/enums/planner-type.enum';

describe('dutyReducer', () => {
	it('should mark static planner duties as loaded by planner id', () => {
		const duty = createDuty({
			id: 'static-duty-a',
			name: 'Static Duty A',
			plannerId: 'planner-a',
		});

		const loadingState = dutyReducer(
			undefined,
			dutyActions.getDutiesByPlannerId({ plannerId: 'planner-a' }),
		);
		const loadedState = dutyReducer(
			loadingState,
			dutyActions.getDutiesByPlannerIdSuccess({
				duties: [duty],
				plannerId: 'planner-a',
			}),
		);

		expect(loadingState.isLoading).toBeTrue();
		expect(selectAll(loadedState)).toEqual([duty]);
		expect(loadedState.loadedPlannerIds).toEqual(['planner-a']);
		expect(loadedState.loadedPlannersDates).toEqual([]);
		expect(loadedState.isLoading).toBeFalse();
	});

	it('should mark dynamic planner duties as loaded by planner id and date range', () => {
		const duty = createDuty({
			effectiveDate: '2026-06-09',
			id: 'dynamic-duty-a',
			name: 'Dynamic Duty A',
			plannerId: 'planner-a',
		});

		const loadingState = dutyReducer(
			undefined,
			dutyActions.getDutiesByRangeTimeAndPlannerId({
				plannerId: 'planner-a',
				from: '2026-06-08',
				to: '2026-06-14',
			}),
		);
		const loadedState = dutyReducer(
			loadingState,
			dutyActions.getDutiesByRangeTimeAndPlannerIdSuccess({
				duties: [duty],
				plannerId: 'planner-a',
				from: '2026-06-08',
				to: '2026-06-14',
			}),
		);

		expect(loadingState.isLoading).toBeTrue();
		expect(selectAll(loadedState)).toEqual([duty]);
		expect(loadedState.loadedPlannerIds).toEqual([]);
		expect(loadedState.loadedPlannersDates).toEqual([
			{ 'planner-a': ['2026-06-08-2026-06-14'] },
		]);
		expect(loadedState.isLoading).toBeFalse();
	});

	it('should not duplicate an already loaded dynamic planner date range', () => {
		const action = dutyActions.getDutiesByRangeTimeAndPlannerIdSuccess({
			duties: [],
			plannerId: 'planner-a',
			from: '2026-06-08',
			to: '2026-06-14',
		});

		const loadedOnceState = dutyReducer(undefined, action);
		const loadedTwiceState = dutyReducer(loadedOnceState, action);

		expect(loadedTwiceState.loadedPlannersDates).toEqual([
			{ 'planner-a': ['2026-06-08-2026-06-14'] },
		]);
	});

	it('should upsert updated duty and preserve loaded planner caches', () => {
		const originalDuty = createDuty({
			id: 'duty-a',
			name: 'Original Duty',
		});
		const updatedDuty = createDuty({
			id: 'duty-a',
			name: 'Updated Duty',
		});
		const loadedState = dutyReducer(
			undefined,
			dutyActions.getDutiesByRangeTimeAndPlannerIdSuccess({
				duties: [originalDuty],
				plannerId: 'planner-a',
				from: '2026-06-08',
				to: '2026-06-14',
			}),
		);

		const updatingState = dutyReducer(
			loadedState,
			dutyActions.updateDuty({
				duty: updatedDuty,
				dutyId: 'duty-a',
				plannerId: 'planner-a',
				plannerType: PlannerType.Dynamic,
				redirectToBoard: true,
			}),
		);
		const updatedState = dutyReducer(
			updatingState,
			dutyActions.updateDutySuccess({ duty: updatedDuty }),
		);

		expect(updatingState.isLoading).toBeTrue();
		expect(selectAll(updatedState)).toEqual([updatedDuty]);
		expect(updatedState.loadedPlannersDates).toEqual([
			{ 'planner-a': ['2026-06-08-2026-06-14'] },
		]);
		expect(updatedState.isLoading).toBeFalse();
	});

	it('should remove deleted duty and preserve loaded planner caches', () => {
		const duty = createDuty({ id: 'duty-a' });
		const loadedState = dutyReducer(
			undefined,
			dutyActions.getDutiesByPlannerIdSuccess({
				duties: [duty],
				plannerId: 'planner-a',
			}),
		);

		const deletingState = dutyReducer(
			loadedState,
			dutyActions.deleteDuty({
				dutyId: 'duty-a',
				plannerId: 'planner-a',
			}),
		);
		const deletedState = dutyReducer(
			deletingState,
			dutyActions.deleteDutySuccess({ dutyId: 'duty-a' }),
		);

		expect(deletingState.isLoading).toBeTrue();
		expect(selectAll(deletedState)).toEqual([]);
		expect(deletedState.loadedPlannerIds).toEqual(['planner-a']);
		expect(deletedState.isLoading).toBeFalse();
	});

	it('should reset duty state', () => {
		const duty: DutyDto = {
			from: '08:00',
			id: 'duty-a',
			name: 'Duty A',
			to: '09:00',
		};

		const loadedState = dutyReducer(
			undefined,
			dutyActions.getDutiesByPlannerIdSuccess({
				duties: [duty],
				plannerId: 'planner-a',
			}),
		);

		const resetState = dutyReducer(loadedState, dutyActions.resetDuties());

		expect(selectAll(resetState)).toEqual([]);
		expect(resetState.loadedPlannerIds).toEqual([]);
		expect(resetState.loadedPlannersDates).toEqual([]);
		expect(resetState.allDutiesLoaded).toBeFalse();
		expect(resetState.error).toBeNull();
		expect(resetState.isLoading).toBeFalse();
	});
});

function createDuty(overrides: Partial<DutyDto> = {}): DutyDto {
	return {
		from: '08:00',
		id: 'duty-a',
		name: 'Duty A',
		plannerId: 'planner-a',
		to: '09:00',
		...overrides,
	};
}
