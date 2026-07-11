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

	it('should upsert updated planner on update success', () => {
		const originalPlanner: PlannerDto = {
			id: 'planner-a',
			name: 'Planner A',
			startTime: '08:00',
			endTime: '16:00',
		};
		const updatedPlanner: PlannerDto = {
			id: 'planner-a',
			name: 'Updated Planner A',
			startTime: '08:00',
			endTime: '16:00',
		};
		const loadedState = plannerReducer(
			undefined,
			plannerActions.getPlannersSuccess({ planners: [originalPlanner] }),
		);

		const updatedState = plannerReducer(
			loadedState,
			plannerActions.updatePlannerSuccess({
				planner: updatedPlanner,
				shapeChangeConfirmed: false,
			}),
		);

		expect(selectAll(updatedState)).toEqual([updatedPlanner]);
		expect(updatedState.isLoading).toBeFalse();
	});

	it('should remove deleted planner on delete success', () => {
		const plannerA: PlannerDto = {
			id: 'planner-a',
			name: 'Planner A',
			startTime: '08:00',
			endTime: '16:00',
		};
		const plannerB: PlannerDto = {
			id: 'planner-b',
			name: 'Planner B',
			startTime: '09:00',
			endTime: '17:00',
		};
		const loadedState = plannerReducer(
			undefined,
			plannerActions.getPlannersSuccess({ planners: [plannerA, plannerB] }),
		);

		const updatedState = plannerReducer(
			loadedState,
			plannerActions.deletePlannerSuccess({ id: 'planner-a' }),
		);

		expect(selectAll(updatedState)).toEqual([plannerB]);
		expect(updatedState.isLoading).toBeFalse();
	});
});
