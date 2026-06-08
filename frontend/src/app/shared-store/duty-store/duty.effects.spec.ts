import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/auth/auth.service';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { ERROR_CODE_TRANSLATE_KEY } from '@shared/constants/translation-keys.const';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { plannerActions } from '@shared-store/planner-store/planner.actions';
import { ReplaySubject, firstValueFrom, throwError } from 'rxjs';
import { DutyControllerService } from 'src/api/services';
import { dutyActions } from './duty.actions';
import {
	getDutiesByPlannerIdAndRangeTime,
	getDutiesByPlannerIdEffect,
} from './duty.effects';

describe('duty effects', () => {
	let actions$: ReplaySubject<Action>;
	let dutyControllerServiceSpy: jasmine.SpyObj<DutyControllerService>;
	let snackBarServiceSpy: jasmine.SpyObj<SnackBarService>;
	let routerHelperServiceSpy: jasmine.SpyObj<RouterHelperService>;
	let authServiceSpy: jasmine.SpyObj<AuthService>;
	let storeSpy: jasmine.SpyObj<Store>;

	beforeEach(() => {
		actions$ = new ReplaySubject<Action>(1);
		dutyControllerServiceSpy =
			jasmine.createSpyObj<DutyControllerService>(
				'DutyControllerService',
				['getDutiesByPlannerId', 'getDutiesByPlannerIdAndRangeTime'],
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

	it('should clear auth state and route to auth when static duty load fails with 401', async () => {
		const error = createHttpError(401);
		dutyControllerServiceSpy.getDutiesByPlannerId.and.returnValue(
			throwError(() => error),
		);

		const resultPromise = firstValueFrom(createStaticDutiesEffect());
		actions$.next(
			dutyActions.getDutiesByPlannerId({ plannerId: 'planner-a' }),
		);
		const result = await resultPromise;

		expect(result).toEqual(
			dutyActions.getDutiesByPlannerIdFailure({
				errorMessage: error.message,
			}),
		);
		expectInvalidSessionRecovery(401);
	});

	it('should clear auth state and route to auth when dynamic duty load fails with 401', async () => {
		const error = createHttpError(401);
		dutyControllerServiceSpy.getDutiesByPlannerIdAndRangeTime.and.returnValue(
			throwError(() => error),
		);

		const resultPromise = firstValueFrom(createDynamicDutiesEffect());
		actions$.next(
			dutyActions.getDutiesByRangeTimeAndPlannerId({
				plannerId: 'planner-a',
				from: '2026-06-08',
				to: '2026-06-14',
			}),
		);
		const result = await resultPromise;

		expect(result).toEqual(
			dutyActions.getDutiesByRangeTimeAndPlannerIdFailure({
				errorMessage: error.message,
			}),
		);
		expectInvalidSessionRecovery(401);
	});

	[403, 404].forEach((status) => {
		it(`should keep auth state and route to planners when static duty load fails with ${status}`, async () => {
			const error = createHttpError(status);
			dutyControllerServiceSpy.getDutiesByPlannerId.and.returnValue(
				throwError(() => error),
			);

			const resultPromise = firstValueFrom(createStaticDutiesEffect());
			actions$.next(
				dutyActions.getDutiesByPlannerId({ plannerId: 'planner-a' }),
			);
			const result = await resultPromise;

			expect(result).toEqual(
				dutyActions.getDutiesByPlannerIdFailure({
					errorMessage: error.message,
				}),
			);
			expectProtectedResourceRecovery(status);
		});

		it(`should keep auth state and route to planners when dynamic duty load fails with ${status}`, async () => {
			const error = createHttpError(status);
			dutyControllerServiceSpy.getDutiesByPlannerIdAndRangeTime.and.returnValue(
				throwError(() => error),
			);

			const resultPromise = firstValueFrom(createDynamicDutiesEffect());
			actions$.next(
				dutyActions.getDutiesByRangeTimeAndPlannerId({
					plannerId: 'planner-a',
					from: '2026-06-08',
					to: '2026-06-14',
				}),
			);
			const result = await resultPromise;

			expect(result).toEqual(
				dutyActions.getDutiesByRangeTimeAndPlannerIdFailure({
					errorMessage: error.message,
				}),
			);
			expectProtectedResourceRecovery(status);
		});
	});

	function createStaticDutiesEffect() {
		return getDutiesByPlannerIdEffect(
			new Actions(actions$),
			dutyControllerServiceSpy,
			snackBarServiceSpy,
			routerHelperServiceSpy,
			authServiceSpy,
			storeSpy,
		);
	}

	function createDynamicDutiesEffect() {
		return getDutiesByPlannerIdAndRangeTime(
			new Actions(actions$),
			dutyControllerServiceSpy,
			snackBarServiceSpy,
			routerHelperServiceSpy,
			authServiceSpy,
			storeSpy,
		);
	}

	function expectInvalidSessionRecovery(status: number): void {
		expect(snackBarServiceSpy.onShowSnackBarError).toHaveBeenCalledWith({
			message: ERROR_CODE_TRANSLATE_KEY,
			dynamicMessage: {
				errorCode: status,
			},
		});
		expect(storeSpy.dispatch).toHaveBeenCalledWith(
			plannerActions.resetPlanners(),
		);
		expect(storeSpy.dispatch).toHaveBeenCalledWith(dutyActions.resetDuties());
		expect(authServiceSpy.logout).toHaveBeenCalled();
		expect(routerHelperServiceSpy.directToUrl).toHaveBeenCalledWith('/auth');
	}

	function expectProtectedResourceRecovery(status: number): void {
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
	}
});

function createHttpError(status: number): HttpErrorResponse {
	return new HttpErrorResponse({
		status,
		statusText: 'Backend rejection',
		url: '/api/v1/duties/planner-a',
	});
}
