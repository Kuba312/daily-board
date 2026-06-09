import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/auth/auth.service';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { ERROR_CODE_TRANSLATE_KEY } from '@shared/constants/translation-keys.const';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { dutyActions } from '@shared-store/duty-store/duty.actions';
import { ReplaySubject, firstValueFrom, throwError } from 'rxjs';
import { PlannerControllerService } from 'src/api/services';
import { getPlannerEffect } from './planner.effects';
import { plannerActions } from './planner.actions';

describe('planner effects', () => {
	let actions$: ReplaySubject<Action>;
	let plannerControllerServiceSpy: jasmine.SpyObj<PlannerControllerService>;
	let snackBarServiceSpy: jasmine.SpyObj<SnackBarService>;
	let routerHelperServiceSpy: jasmine.SpyObj<RouterHelperService>;
	let authServiceSpy: jasmine.SpyObj<AuthService>;
	let storeSpy: jasmine.SpyObj<Store>;

	beforeEach(() => {
		actions$ = new ReplaySubject<Action>(1);
		plannerControllerServiceSpy =
			jasmine.createSpyObj<PlannerControllerService>(
				'PlannerControllerService',
				['getPlannerById'],
			);
		snackBarServiceSpy = jasmine.createSpyObj<SnackBarService>(
			'SnackBarService',
			['onShowSnackBarError'],
		);
		routerHelperServiceSpy = jasmine.createSpyObj<RouterHelperService>(
			'RouterHelperService',
			['directToUrl'],
		);
		authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
			'logout',
		]);
		storeSpy = jasmine.createSpyObj<Store>('Store', ['dispatch']);
	});

	it('should clear auth state and route to auth when planner detail fails with 401', async () => {
		const error = createHttpError(401);
		plannerControllerServiceSpy.getPlannerById.and.returnValue(
			throwError(() => error),
		);

		const resultPromise = firstValueFrom(createGetPlannerEffect());
		actions$.next(plannerActions.getPlanner({ id: 'planner-a' }));
		const result = await resultPromise;

		expect(result).toEqual(
			plannerActions.getPlannerFailure({
				errorMessage: error.message,
			}),
		);
		expect(snackBarServiceSpy.onShowSnackBarError).toHaveBeenCalledWith({
			message: ERROR_CODE_TRANSLATE_KEY,
			dynamicMessage: {
				errorCode: 401,
			},
		});
		expect(storeSpy.dispatch).toHaveBeenCalledWith(
			plannerActions.resetPlanners(),
		);
		expect(storeSpy.dispatch).toHaveBeenCalledWith(dutyActions.resetDuties());
		expect(authServiceSpy.logout).toHaveBeenCalled();
		expect(routerHelperServiceSpy.directToUrl).toHaveBeenCalledWith('/auth');
	});

	[403, 404].forEach((status) => {
		it(`should keep auth state and route to planners when planner detail fails with ${status}`, async () => {
			const error = createHttpError(status);
			plannerControllerServiceSpy.getPlannerById.and.returnValue(
				throwError(() => error),
			);

			const resultPromise = firstValueFrom(createGetPlannerEffect());
			actions$.next(plannerActions.getPlanner({ id: 'planner-a' }));
			const result = await resultPromise;

			expect(result).toEqual(
				plannerActions.getPlannerFailure({
					errorMessage: error.message,
				}),
			);
			expect(snackBarServiceSpy.onShowSnackBarError).toHaveBeenCalledWith({
				message: ERROR_CODE_TRANSLATE_KEY,
				dynamicMessage: {
					errorCode: status,
				},
			});
			expect(authServiceSpy.logout).not.toHaveBeenCalled();
			expect(storeSpy.dispatch).not.toHaveBeenCalled();
			expect(routerHelperServiceSpy.directToUrl).toHaveBeenCalledWith(
				'/planners',
			);
		});
	});

	function createGetPlannerEffect() {
		return getPlannerEffect(
			new Actions(actions$),
			plannerControllerServiceSpy,
			snackBarServiceSpy,
			routerHelperServiceSpy,
			authServiceSpy,
			storeSpy,
		);
	}
});

function createHttpError(status: number): HttpErrorResponse {
	return new HttpErrorResponse({
		status,
		statusText: 'Backend rejection',
		url: '/api/v1/planners/planner-a',
	});
}
