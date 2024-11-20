import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { catchError, map, of, switchMap } from 'rxjs';
import { PlannerControllerService } from 'src/api/services';
import { showGeneralErrorMessage } from '../helpers/show-error-message.helper';
import { plannerActions } from './planner.actions';
import moment from 'moment';

import { PlannerDto } from 'src/api/models/planner-dto';
import {
	TIME_FORMAT_WITH_SECONDS,
	TIME_FORMAT,
} from '@shared/constants/shared-consts.const';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';

export const savePlannerEffect = createEffect(
	(
		$actions = inject(Actions),
		plannerControllerService = inject(PlannerControllerService),
		snackBarService = inject(SnackBarService),
		routerHelperService = inject(RouterHelperService),
	) =>
		$actions.pipe(
			ofType(plannerActions.savePlanner),
			switchMap(({ planner, redirectToPlanners }) =>
				plannerControllerService.savePlanner({ body: planner }).pipe(
					map((savedPlanner) => {
						snackBarService.onShowSnackBarSuccess({
							message: 'planner-form.planner-has-been-added',
						});

						const adjustedTimePlanner =
							adjustTimeInPlanner(savedPlanner);

						redirectToPlannersDashboard(
							redirectToPlanners,
							routerHelperService,
						);

						return plannerActions.savePlannerSuccess({
							planner: adjustedTimePlanner,
						});
					}),
					catchError((error: HttpErrorResponse) => {
						showGeneralErrorMessage(snackBarService, error);

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

export const getPlannersEffect = createEffect(
	(
		$actions = inject(Actions),
		plannerControllerService = inject(PlannerControllerService),
		snackBarService = inject(SnackBarService),
	) =>
		$actions.pipe(
			ofType(plannerActions.getPlanners),
			switchMap(() =>
				plannerControllerService.getPlanners().pipe(
					map((plannersResponse) => {
						const planners = adjustTimeInPlanners(plannersResponse);

						return plannerActions.getPlannersSuccess({
							planners,
						});
					}),
					catchError((error: HttpErrorResponse) => {
						showGeneralErrorMessage(snackBarService, error);

						return of(
							plannerActions.getPlannersFailure({
								errorMessage: error?.message ?? '',
							}),
						);
					}),
				),
			),
		),
	{ functional: true },
);

export const getPlannerEffect = createEffect(
	(
		$actions = inject(Actions),
		plannerControllerService = inject(PlannerControllerService),
		snackBarService = inject(SnackBarService),
	) =>
		$actions.pipe(
			ofType(plannerActions.getPlanner),
			switchMap(({ id }) =>
				plannerControllerService.getPlannerById({ id }).pipe(
					map((plannerResponse) => {
						const planner = adjustTimeInPlanner(plannerResponse);

						return plannerActions.getPlannerSuccess({
							planner,
						});
					}),
					catchError((error: HttpErrorResponse) => {
						showGeneralErrorMessage(snackBarService, error);

						return of(
							plannerActions.getPlannerFailure({
								errorMessage: error?.message ?? '',
							}),
						);
					}),
				),
			),
		),
	{ functional: true },
);

function redirectToPlannersDashboard(
	redirectToPlanners: boolean,
	routerHelperService: RouterHelperService,
): void {
	if (redirectToPlanners) {
		routerHelperService.directToUrl('/planners');
	}
}

function adjustTimeInPlanners(plannersResponse: PlannerDto[]): PlannerDto[] {
	return plannersResponse.map((planner) => adjustTimeInPlanner(planner));
}

function adjustTimeInPlanner(plannerResponse: PlannerDto): PlannerDto {
	return {
		...plannerResponse,
		startTime: moment(
			plannerResponse.startTime,
			TIME_FORMAT_WITH_SECONDS,
		).format(TIME_FORMAT),
		endTime: moment(
			plannerResponse.endTime,
			TIME_FORMAT_WITH_SECONDS,
		).format(TIME_FORMAT),
	};
}
