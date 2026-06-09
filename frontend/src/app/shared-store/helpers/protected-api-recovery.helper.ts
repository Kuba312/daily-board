import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/auth/auth.service';
import { Store } from '@ngrx/store';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { dutyActions } from '@shared-store/duty-store/duty.actions';
import { plannerActions } from '@shared-store/planner-store/planner.actions';

export const enum ProtectedApiRejection {
	InvalidSession = 'invalid-session',
	ProtectedResourceUnavailable = 'protected-resource-unavailable',
}

interface ProtectedApiRecoveryDependencies {
	authService: AuthService;
	routerHelperService: RouterHelperService;
	store: Store;
}

export function classifyProtectedApiRejection(
	error: unknown,
): ProtectedApiRejection | null {
	if (!(error instanceof HttpErrorResponse)) {
		return null;
	}

	switch (error.status) {
		case 401:
			return ProtectedApiRejection.InvalidSession;
		case 403:
		case 404:
			return ProtectedApiRejection.ProtectedResourceUnavailable;
		default:
			return null;
	}
}

export function recoverFromProtectedApiRejection(
	error: unknown,
	{
		authService,
		routerHelperService,
		store,
	}: ProtectedApiRecoveryDependencies,
): ProtectedApiRejection | null {
	const rejection = classifyProtectedApiRejection(error);

	if (rejection === ProtectedApiRejection.InvalidSession) {
		store.dispatch(plannerActions.resetPlanners());
		store.dispatch(dutyActions.resetDuties());
		authService.logout();
		routerHelperService.directToUrl('/auth');
	}

	if (rejection === ProtectedApiRejection.ProtectedResourceUnavailable) {
		routerHelperService.directToUrl('/planners');
	}

	return rejection;
}
