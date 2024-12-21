import { inject, signal, WritableSignal } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	ResolveFn,
	RouterStateSnapshot,
} from '@angular/router'; 
import { Optional } from '@core/types/basics.types';
import { DutyHelperService } from '@shared/services/duty-helper/duty-helper.service';
import { Store } from '@ngrx/store';
import { dutyActions } from '@shared-store/duty-store/duty.actions';
import { isPlannerLoaded } from '@shared-store/duty-store/duty.selectors';
import {
	DYNAMIC_PLANNER,
	IS_DYNAMIC_PLANNER,
	PLANNER_ID,
} from '@shared/constants/shared-consts.const';
import { filter, finalize, first, Observable, tap } from 'rxjs';

const loading: WritableSignal<boolean> = signal(false);

export const dutiesResolver: ResolveFn<boolean> = (
	_route: ActivatedRouteSnapshot,
	_state: RouterStateSnapshot,
	store: Store = inject(Store),
	dutyHelperService = inject(DutyHelperService),
): Observable<boolean> => {
	const plannerId = _route.params[PLANNER_ID];
	const isDynamic = isDynamicPlanner(_route);
	const [from, to] =
		dutyHelperService.adjustCurrentWeekDatesToYearMonthDayFormat();
	const [fromDate, toDate] = getRangeDatesForPlanner(isDynamic, from, to);

	return store.select(isPlannerLoaded(plannerId, fromDate, toDate)).pipe(
		tap((areLoaded) => {
			if (!loading() && !areLoaded) {
				loading.set(true);
				dispatchDutiesFetch(isDynamic, store, plannerId, from, to);
			}
		}),
		filter((areLoaded) => !!areLoaded),
		first(),
		finalize(() => loading.set(false)),
	);
};

function getRangeDatesForPlanner(
	isDynamic: boolean,
	from: string,
	to: string,
): [Optional<string>, Optional<string>] {
	return isDynamic ? [from, to] : [undefined, undefined];
}

function dispatchDutiesFetch(
	isDynamic: boolean,
	store: Store<object>,
	plannerId: string,
	from: string,
	to: string,
): void {
	if (isDynamic) {
		store.dispatch(
			dutyActions.getDutiesByRangeTimeAndPlannerId({
				plannerId,
				from,
				to,
			}),
		);

		return;
	}

	store.dispatch(dutyActions.getDutiesByPlannerId({ plannerId }));
}

function isDynamicPlanner(route: ActivatedRouteSnapshot): boolean {
	return route.params[IS_DYNAMIC_PLANNER] === DYNAMIC_PLANNER;
}
