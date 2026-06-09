import { DutyDto } from 'src/api/models';
import { dutyActions } from './duty.actions';
import { dutyReducer, selectAll } from './duty.reducer';

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
