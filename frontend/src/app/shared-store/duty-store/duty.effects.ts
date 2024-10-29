import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { DutyControllerService } from 'src/api/services';
import { dutyActions } from './duty.actions';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { ERROR_CODE_TRANSLATE_KEY } from '@shared/constants/translation-keys.const';

export const saveDutyEffect = createEffect(
	(
		$actions = inject(Actions),
		dutyControllerService = inject(DutyControllerService),
		snackBarService = inject(SnackBarService),
	) =>
		$actions.pipe(
			ofType(dutyActions.saveDuty),
			switchMap(({ duty }) =>
				dutyControllerService.saveDuty({ body: duty }).pipe(
					map((savedDuty) => {
						snackBarService.onShowSnackBarSuccess({
							message: 'task-board-form.task-has-been-added',
						});

						return dutyActions.saveDutySuccess({ duty: savedDuty });
					}),
					catchError((error: HttpErrorResponse) => {
						snackBarService.onShowSnackBarError({
							message: ERROR_CODE_TRANSLATE_KEY,
							dynamicMessage: { errorCode: error.status },
						});

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
