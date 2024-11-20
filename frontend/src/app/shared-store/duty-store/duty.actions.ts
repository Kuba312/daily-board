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
	GetDutiesByPlannerIdFailure = 'Get duties by planner id failure'
}

export const dutyActions = createActionGroup({
	source: 'duty',
	events: {
		[DutyActions.SaveDuty]: props<{
			duty: DutyDto;
			plannerId: string;
			redirectToBoard: boolean;
		}>(),
		[DutyActions.SaveDutySuccess]: props<{
			duty: DutyDto;
			plannerId: string;
		}>(),
		[DutyActions.SaveDutyFailure]: props<{
			errorMessage: string;
		}>(),
		[DutyActions.GetDutiesByPlannerId]: props<{ plannerId: string }>(),
		[DutyActions.GetDutiesByPlannerIdSuccess]: props<{ duties: DutyDto[]; plannerId: string }>(),
		[DutyActions.GetDutiesByPlannerIdFailure]: props<{ errorMessage: string}>(),
		[DutyActions.GetDutiesWithoutDates]: emptyProps(),
		[DutyActions.GetDutiesWithoutDatesSuccess]: props<{
			duties: DutyDto[];
		}>(),
		[DutyActions.GetDutiesWithoutDatesFailure]: props<{
			errorMessage: string;
		}>(),
	},
});
