import { DutyDto } from 'src/api/models';
import { dutyActions } from './duty.actions';
import { dutyReducer, selectAll } from './duty.reducer';

describe('dutyReducer', () => {
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
