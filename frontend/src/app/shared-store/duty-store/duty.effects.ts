import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { DutyControllerService } from 'src/api/services';
import { dutyActions } from './duty.actions';

export const saveDutyEffect = createEffect(
	(
		$actions = inject(Actions),
		dutyControllerService = inject(DutyControllerService),
	) =>
		$actions.pipe(
			ofType(dutyActions.saveDuty),
			switchMap(({ duty }) =>
				dutyControllerService.saveDuty({ body: duty }).pipe(
					map((savedDuty) =>
						dutyActions.saveDutySuccess({ duty: savedDuty }),
					),
					catchError((error: HttpErrorResponse) =>
						of(
							dutyActions.saveDutyFailure({
								errorMessage: error?.message ?? '',
							}),
						),
					),
				),
			),
		),
	{ functional: true },
);
