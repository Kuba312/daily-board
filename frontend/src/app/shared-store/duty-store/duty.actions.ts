import { PlannerType } from '@shared/enums/planner-type.enum';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DutyDto } from 'src/api/models';

export const enum DutyActions {
	SaveDuty = 'Save duty',
	SaveDutySuccess = 'Save duty success',
	SaveDutyFailure = 'Save duty failure',
	GetDutiesWithoutDates = 'Get duties without dates',
	GetDutiesWithoutDatesSuccess = 'Get duties without dates success',
	GetDutiesWithoutDatesFailure = 'Get duties without dates failure',
	GetDutiesByPlannerId = 'Get duties by planner id',
	GetDutiesByPlannerIdSuccess = 'Get duties by planner id success',
	GetDutiesByPlannerIdFailure = 'Get duties by planner id failure',
	GetDutiesByRangeTimeAndPlannerId = 'Get duties by range time and planner id',
	GetDutiesByRangeTimeAndPlannerIdSuccess = 'Get duties by range time and planner id success',
	GetDutiesByRangeTimeAndPlannerIdFailure = 'Get duties by range time and planner id failure',
	ResetDuties = 'Reset duties',
}

export const dutyActions = createActionGroup({
	source: 'duty',
	events: {
		[DutyActions.SaveDuty]: props<{
			duties: DutyDto[];
			plannerId: string;
			redirectToBoard: boolean;
			plannerType: PlannerType;
		}>(),
		[DutyActions.SaveDutySuccess]: props<{
			duties: DutyDto[];
			plannerId: string;
		}>(),
		[DutyActions.SaveDutyFailure]: props<{
			errorMessage: string;
		}>(),
		[DutyActions.GetDutiesByPlannerId]: props<{ plannerId: string }>(),
		[DutyActions.GetDutiesByPlannerIdSuccess]: props<{
			duties: DutyDto[];
			plannerId: string;
		}>(),
		[DutyActions.GetDutiesByPlannerIdFailure]: props<{
			errorMessage: string;
		}>(),
		[DutyActions.GetDutiesWithoutDates]: emptyProps(),
		[DutyActions.GetDutiesWithoutDatesSuccess]: props<{
			duties: DutyDto[];
		}>(),
		[DutyActions.GetDutiesWithoutDatesFailure]: props<{
			errorMessage: string;
		}>(),
		[DutyActions.GetDutiesByRangeTimeAndPlannerId]: props<{
			plannerId: string;
			from: string;
			to: string;
		}>(),
		[DutyActions.GetDutiesByRangeTimeAndPlannerIdSuccess]: props<{
			duties: DutyDto[];
			plannerId: string;
			from: string; 
			to: string;
		}>(),
		[DutyActions.GetDutiesByRangeTimeAndPlannerIdFailure]: props<{
			errorMessage: string;
		}>(),
		[DutyActions.ResetDuties]: emptyProps(),
	},
});
