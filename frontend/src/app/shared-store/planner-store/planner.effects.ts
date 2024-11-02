import { inject } from '@angular/core';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PlannerControllerService } from 'src/api/services';
import { plannerActions } from './planner.actions';
import { catchError, map, of, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ERROR_CODE_TRANSLATE_KEY } from '@shared/constants/translation-keys.const';

export const savePlannerEffect = createEffect(
	(
		$actions = inject(Actions),
		plannerControllerService = inject(PlannerControllerService),
		snackBarService = inject(SnackBarService),
	) =>
		$actions.pipe(
			ofType(plannerActions.savePlanner),
			switchMap(({ planner }) =>
				plannerControllerService.savePlanner({ body: planner }).pipe(
					map((savedPlanner) => {
						snackBarService.onShowSnackBarSuccess({
							message: 'planner-form.planner-has-been-added',
						});

						return plannerActions.savePlannerSuccess({
							planner: savedPlanner,
						});
					}),
					catchError((error: HttpErrorResponse) => {
						snackBarService.onShowSnackBarError({
							message: ERROR_CODE_TRANSLATE_KEY,
							dynamicMessage: {
								errorCode: error.status,
							},
						});

						return of(
							plannerActions.savePlannerFailure({
								errorMessage: error?.message ?? '',
							}),
						);
					}),
				),
			),
		),
	{ functional: true },
);
