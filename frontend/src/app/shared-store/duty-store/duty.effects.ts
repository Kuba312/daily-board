import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { adjustTimeInDuties } from '@shared/helpers/adjust-time-in-duties.helper';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { catchError, map, of, switchMap } from 'rxjs';
import { DutyControllerService } from 'src/api/services';
import { showErrorMessage } from '../helpers/show-error-message.helper';
import { dutyActions } from './duty.actions';

export const saveDutyEffect = createEffect(
	(
		$actions = inject(Actions),
		dutyControllerService = inject(DutyControllerService),
		snackBarService = inject(SnackBarService),
	) =>
		$actions.pipe(
			ofType(dutyActions.saveDuty),
			switchMap(({ duty, plannerId }) =>
				dutyControllerService.saveDuty({ body: duty, plannerId }).pipe(
					map((savedDuty) => {
						snackBarService.onShowSnackBarSuccess({
							message: 'task-board-form.task-has-been-added',
						});

						return dutyActions.saveDutySuccess({
							duty: savedDuty,
							plannerId,
						});
					}),
					catchError((error: HttpErrorResponse) => {
						showErrorMessage(snackBarService, error);

						return of(
							dutyActions.saveDutyFailure({
								errorMessage: error?.message ?? '',
							}),
						);
					}),
				),
			),
		),
	{ functional: true },
);

export const getDutiesWithoutDatesEffect = createEffect(
	(
		$actions = inject(Actions),
		dutyControllerService = inject(DutyControllerService),
		snackBarService = inject(SnackBarService),
	) =>
		$actions.pipe(
			ofType(dutyActions.getDutiesWithoutDates),
			switchMap(() =>
				dutyControllerService.getDutiesWithoutDates().pipe(
					map((dutiesResponse) => {
						const duties = adjustTimeInDuties(dutiesResponse);

						return dutyActions.getDutiesWithoutDatesSuccess({
							duties,
						});
					}),
					catchError((error: HttpErrorResponse) => {
						showErrorMessage(snackBarService, error);

						return of(
							dutyActions.getDutiesWithoutDatesFailure({
								errorMessage: error?.message ?? '',
							}),
						);
					}),
				),
			),
		),
	{ functional: true },
);

export const getDutiesByPlannerIdEffect = createEffect(
	(
		$actions = inject(Actions),
		dutyControllerService = inject(DutyControllerService),
		snackBarService = inject(SnackBarService),
	) =>
		$actions.pipe(
			ofType(dutyActions.getDutiesByPlannerId),
			switchMap(({ plannerId }) =>
				dutyControllerService.getDutiesByPlannerId({ plannerId }).pipe(
					map((duties) => dutyActions.getDutiesByPlannerIdSuccess({
						duties,
						plannerId,
					})),
					catchError((error: HttpErrorResponse) => {
						showErrorMessage(snackBarService, error);

						return of(
							dutyActions.getDutiesWithoutDatesFailure({
								errorMessage: error?.message ?? '',
							}),
						);
					}),
				),
			),
		),
	{ functional: true },
);
