import { PlannerDto } from 'src/api/models';
import { plannerActions } from './planner.actions';
import { plannerReducer, selectAll } from './planner.reducer';

describe('plannerReducer', () => {
	it('should reset planner state', () => {
		const planner: PlannerDto = {
			id: 'planner-a',
			name: 'Planner A',
		};

		const loadedState = plannerReducer(
			undefined,
			plannerActions.getPlannersSuccess({ planners: [planner] }),
		);

		const resetState = plannerReducer(
			loadedState,
			plannerActions.resetPlanners(),
		);

		expect(selectAll(resetState)).toEqual([]);
		expect(resetState.allPlannersLoaded).toBeFalse();
		expect(resetState.error).toBeNull();
		expect(resetState.isLoading).toBeFalse();
	});
});
