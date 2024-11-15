import { inject, signal, WritableSignal } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	ResolveFn,
	RouterStateSnapshot,
} from '@angular/router';
import { isPlannerLoaded } from '@shared-store/duty-store/duty.selectors';
import { Store } from '@ngrx/store';
import { dutyActions } from '@shared-store/duty-store/duty.actions';
import { filter, finalize, first, Observable, tap } from 'rxjs';
import { PLANNER_ID } from '@shared/constants/shared-consts.const';

const loading: WritableSignal<boolean> = signal(false);

export const dutiesResolver: ResolveFn<boolean> = (
	_route: ActivatedRouteSnapshot,
	_state: RouterStateSnapshot,
	store: Store = inject(Store),
): Observable<boolean> => {
	const plannerId = _route.params[PLANNER_ID];

	return store.select(isPlannerLoaded(plannerId)).pipe(
		tap((areLoaded) => {
			if (!loading() && !areLoaded) {
				loading.set(true);

				store.dispatch(dutyActions.getDutiesByPlannerId({ plannerId }));
			}
		}),
		filter((areLoaded) => !!areLoaded),
		first(),
		finalize(() => loading.set(false)),
	);
};
