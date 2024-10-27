import { createActionGroup, props } from '@ngrx/store';
import { DutyDto } from 'src/api/models';

export const enum DutyActions {
	SaveDuty = 'Save duty',
	SaveDutySuccess = 'Save duty success',
	SaveDutyFailure = 'Save duty failure'
}

export const dutyActions = createActionGroup({
	source: 'duty',
	events: {
		[DutyActions.SaveDuty]: props<{
			duty: DutyDto;
		}>(),
		[DutyActions.SaveDutySuccess]: props<{
			duty: DutyDto;
		}>(),
		[DutyActions.SaveDutyFailure]: props<{
			errorMessage: string;
		}>(),
	},
});
