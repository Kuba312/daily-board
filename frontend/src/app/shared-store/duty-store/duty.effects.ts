import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import {
	TIME_FORMAT,
	TIME_FORMAT_WITH_SECONDS,
	YEAR_MOTH_DAY_FORMAT,
} from '@shared/constants/shared-consts.const';
import {
	CONFLICT_ERROR_STATUS,
	DUTIES_CONFLICT_MESSAGE_TIME,
} from '@core/app.consts';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ConflictingDuty } from '@shared/models/conflicting-duty';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import moment from 'moment';
import { catchError, map, of, switchMap } from 'rxjs';
import { DutyDto } from 'src/api/models';
import { DutyControllerService } from 'src/api/services';
import {
	showCustomErrorMessage,
	showGeneralErrorMessage,
} from '../helpers/show-error-message.helper';
import { recoverFromProtectedApiRejection } from '../helpers/protected-api-recovery.helper';
import { dutyActions } from './duty.actions';
import { PlannerType } from '@shared/enums/planner-type.enum';

export const saveDutyEffect = createEffect(
	(
		$actions = inject(Actions),
		dutyControllerService = inject(DutyControllerService),
		snackBarService = inject(SnackBarService),
		routerHelperService = inject(RouterHelperService),
		authService = inject(AuthService),
		store = inject(Store),
	) =>
		$actions.pipe(
			ofType(dutyActions.saveDuty),
			switchMap(({ duties, plannerId, redirectToBoard, plannerType }) =>
				dutyControllerService
					.saveDuty({ body: duties, plannerId })
					.pipe(
						map((savedDuties) => {
							snackBarService.onShowSnackBarSuccess({
								message: 'task-board-form.task-has-been-added',
							});

							const adjustedTimeDuties =
								adjustTimeInDuties(savedDuties);

							redirectToPlannerBoard(
								redirectToBoard,
								routerHelperService,
								plannerId,
								plannerType,
								adjustedTimeDuties,
							);

							return dutyActions.saveDutySuccess({
								duties: adjustedTimeDuties,
								plannerId,
							});
						}),
						catchError((error: HttpErrorResponse) => {
							const { status } = error;

							if (status === CONFLICT_ERROR_STATUS) {
								showConflictingDutiesErrorMessage(
									error,
									snackBarService,
									DUTIES_CONFLICT_MESSAGE_TIME,
								);

								return of();
							}

							showGeneralErrorMessage(snackBarService, error);
							recoverFromProtectedApiRejection(error, {
								authService,
								routerHelperService,
								store,
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

export const getDutiesWithoutDatesEffect = createEffect(
	(
		$actions = inject(Actions),
		dutyControllerService = inject(DutyControllerService),
		snackBarService = inject(SnackBarService),
		routerHelperService = inject(RouterHelperService),
		authService = inject(AuthService),
		store = inject(Store),
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
						showGeneralErrorMessage(snackBarService, error);
						recoverFromProtectedApiRejection(error, {
							authService,
							routerHelperService,
							store,
						});

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

export const updateDutyEffect = createEffect(
	(
		$actions = inject(Actions),
		dutyControllerService = inject(DutyControllerService),
		snackBarService = inject(SnackBarService),
		routerHelperService = inject(RouterHelperService),
		authService = inject(AuthService),
		store = inject(Store),
	) =>
		$actions.pipe(
			ofType(dutyActions.updateDuty),
			switchMap(
				({
					duty,
					dutyId,
					plannerId,
					plannerType,
					redirectToBoard,
				}) =>
					dutyControllerService
						.updateDuty({ plannerId, dutyId, body: duty })
						.pipe(
							map((updatedDutyResponse) => {
								snackBarService.onShowSnackBarSuccess({
									message: 'task-board-form.task-has-been-updated',
								});

								const updatedDuty =
									adjustTimeInDuty(updatedDutyResponse);

								redirectToPlannerBoard(
									redirectToBoard,
									routerHelperService,
									plannerId,
									plannerType,
									[updatedDuty],
								);

								return dutyActions.updateDutySuccess({
									duty: updatedDuty,
								});
							}),
							catchError((error: HttpErrorResponse) => {
								const { status } = error;

								if (status === CONFLICT_ERROR_STATUS) {
									showConflictingDutiesErrorMessage(
										error,
										snackBarService,
										DUTIES_CONFLICT_MESSAGE_TIME,
									);

									return of(
										dutyActions.updateDutyFailure({
											errorMessage: error?.message ?? '',
										}),
									);
								}

								showGeneralErrorMessage(snackBarService, error);
								recoverFromProtectedApiRejection(error, {
									authService,
									routerHelperService,
									store,
								});

								return of(
									dutyActions.updateDutyFailure({
										errorMessage: error?.message ?? '',
									}),
								);
							}),
						),
			),
		),
	{ functional: true },
);

export const deleteDutyEffect = createEffect(
	(
		$actions = inject(Actions),
		dutyControllerService = inject(DutyControllerService),
		snackBarService = inject(SnackBarService),
		routerHelperService = inject(RouterHelperService),
		authService = inject(AuthService),
		store = inject(Store),
	) =>
		$actions.pipe(
			ofType(dutyActions.deleteDuty),
			switchMap(({ dutyId, plannerId }) =>
				dutyControllerService.deleteDuty({ plannerId, dutyId }).pipe(
					map(() => {
						snackBarService.onShowSnackBarSuccess({
							message: 'task-board-form.task-has-been-deleted',
						});

						return dutyActions.deleteDutySuccess({ dutyId });
					}),
					catchError((error: HttpErrorResponse) => {
						showGeneralErrorMessage(snackBarService, error);
						recoverFromProtectedApiRejection(error, {
							authService,
							routerHelperService,
							store,
						});

						return of(
							dutyActions.deleteDutyFailure({
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
		routerHelperService = inject(RouterHelperService),
		authService = inject(AuthService),
		store = inject(Store),
	) =>
		$actions.pipe(
			ofType(dutyActions.getDutiesByPlannerId),
			switchMap(({ plannerId }) =>
				dutyControllerService.getDutiesByPlannerId({ plannerId }).pipe(
					map((dutiesResponse) => {
						const duties = adjustTimeInDuties(dutiesResponse);

						return dutyActions.getDutiesByPlannerIdSuccess({
							duties,
							plannerId,
						});
					}),
					catchError((error: HttpErrorResponse) => {
						showGeneralErrorMessage(snackBarService, error);
						recoverFromProtectedApiRejection(error, {
							authService,
							routerHelperService,
							store,
						});

						return of(
							dutyActions.getDutiesByPlannerIdFailure({
								errorMessage: error?.message ?? '',
							}),
						);
					}),
				),
			),
		),
	{ functional: true },
);

export const getDutiesByPlannerIdAndRangeTime = createEffect(
	(
		$actions = inject(Actions),
		dutyControllerService = inject(DutyControllerService),
		snackBarService = inject(SnackBarService),
		routerHelperService = inject(RouterHelperService),
		authService = inject(AuthService),
		store = inject(Store),
	) =>
		$actions.pipe(
			ofType(dutyActions.getDutiesByRangeTimeAndPlannerId),
			switchMap(({ plannerId, from, to }) =>
				dutyControllerService
					.getDutiesByPlannerIdAndRangeTime({ plannerId, from, to })
					.pipe(
						map((dutiesResponse) => {
							const duties = adjustTimeInDuties(dutiesResponse);

							return dutyActions.getDutiesByRangeTimeAndPlannerIdSuccess(
								{
									duties,
									plannerId,
									from,
									to,
								},
							);
						}),
						catchError((error: HttpErrorResponse) => {
							showGeneralErrorMessage(snackBarService, error);
							recoverFromProtectedApiRejection(error, {
								authService,
								routerHelperService,
								store,
							});

							return of(
								dutyActions.getDutiesByRangeTimeAndPlannerIdFailure(
									{
										errorMessage: error?.message ?? '',
									},
								),
							);
						}),
					),
			),
		),
	{ functional: true },
);

function redirectToPlannerBoard(
	redirectToBoard: boolean,
	routerHelperService: RouterHelperService,
	plannerId: string,
	plannerType: PlannerType,
	duties?: DutyDto[],
): void {
	if (!redirectToBoard) {
		return;
	}

	routerHelperService.directToUrl(
		'/planners',
		[plannerId, plannerType],
		false,
		getDynamicPlannerWeekQueryParams(plannerType, duties),
	);
}

function getDynamicPlannerWeekQueryParams(
	plannerType: PlannerType,
	duties?: DutyDto[],
): Record<string, string> | undefined {
	if (plannerType !== PlannerType.Dynamic) {
		return undefined;
	}

	const effectiveDate = duties?.find((duty) => duty.effectiveDate)
		?.effectiveDate;

	if (!effectiveDate) {
		return undefined;
	}

	const weekDate = moment(effectiveDate, YEAR_MOTH_DAY_FORMAT);

	return {
		from: weekDate.clone().startOf('isoWeek').format(YEAR_MOTH_DAY_FORMAT),
		to: weekDate.clone().endOf('isoWeek').format(YEAR_MOTH_DAY_FORMAT),
	};
}

function isConflictingDuties(
	conflictingDuties: unknown,
): conflictingDuties is ConflictingDuty[] {
	return (
		!!conflictingDuties &&
		typeof conflictingDuties === 'object' &&
		Array.isArray(conflictingDuties) &&
		conflictingDuties.every((obj) => 'id' in obj && 'name' in obj)
	);
}

function adjustTimeInDuties(plannersResponse: DutyDto[]): DutyDto[] {
	return plannersResponse.map((planner) => adjustTimeInDuty(planner));
}

function adjustTimeInDuty(dutyResponse: DutyDto): DutyDto {
	return {
		...dutyResponse,
		from: moment(dutyResponse.from, TIME_FORMAT_WITH_SECONDS).format(
			TIME_FORMAT,
		),
		to: moment(dutyResponse.to, TIME_FORMAT_WITH_SECONDS).format(
			TIME_FORMAT,
		),
	};
}

function showConflictingDutiesErrorMessage(
	error: HttpErrorResponse,
	snackBarService: SnackBarService,
	messageDuration?: number,
): void {
	const conflictingDutiesResponse = error.error?.information;

	if (
		conflictingDutiesResponse &&
		isConflictingDuties(conflictingDutiesResponse)
	) {
		const conflictingDuties = conflictingDutiesResponse
			.map((duty) => duty.name)
			.join(', ');

		showCustomErrorMessage(
			snackBarService,
			'task-board-form.duty-conflict',
			{ conflictingDuties },
			messageDuration,
		);
	}
}
