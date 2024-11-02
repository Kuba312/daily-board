import { createActionGroup, props } from '@ngrx/store';
import { PlannerDto } from 'src/api/models';

export const enum PlannerActions {
	SavePlanner = 'Save planner',
	SavePlannerSuccess = 'Save planner success',
	SavePlannerFailure = 'Save planner failure'
}

export const plannerActions = createActionGroup({
	source: 'planner',
	events: {
		[PlannerActions.SavePlanner]: props<{
			planner: PlannerDto;
		}>(),
		[PlannerActions.SavePlannerSuccess]: props<{
			planner: PlannerDto;
		}>(),
		[PlannerActions.SavePlannerFailure]: props<{ errorMessage: string }>(),
	},
});
