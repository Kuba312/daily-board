import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PlannerDto } from 'src/api/models';

export const enum PlannerActions {
	SavePlanner = 'Save planner',
	SavePlannerSuccess = 'Save planner success',
	SavePlannerFailure = 'Save planner failure',
	GetPlanners = 'Get planners',
	GetPlannersSuccess = 'Get planners success',
	GetPlannersFailure = 'Get planners failure',
	GetPlanner = 'Get planner',
	GetPlannerSuccess = 'Get planner success',
	GetPlannerFailure = 'Get planner failure',
	ResetPlanners = 'Reset planners',
}

export const plannerActions = createActionGroup({
	source: 'planner',
	events: {
		[PlannerActions.SavePlanner]: props<{
			planner: PlannerDto;
			redirectToPlanners: boolean;
		}>(),
		[PlannerActions.SavePlannerSuccess]: props<{
			planner: PlannerDto;
		}>(),
		[PlannerActions.SavePlannerFailure]: props<{ errorMessage: string }>(),
		[PlannerActions.GetPlanners]: emptyProps(),
		[PlannerActions.GetPlannersSuccess]: props<{
			planners: PlannerDto[];
		}>(),
		[PlannerActions.GetPlannersFailure]: props<{ errorMessage: string }>(),
		[PlannerActions.GetPlanner]: props<{id: string}>(),
		[PlannerActions.GetPlannerSuccess]: props<{planner: PlannerDto}>(),
		[PlannerActions.GetPlannerFailure]: props<{errorMessage: string}>(),
		[PlannerActions.ResetPlanners]: emptyProps(),
	},
});
