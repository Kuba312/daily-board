import { inject, signal, WritableSignal } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	ResolveFn,
	RouterStateSnapshot,
} from '@angular/router';
import { selectAllDutiesLoaded } from '@shared-store/duty-store/duty.reducer';
import { Store } from '@ngrx/store';
import { filter, finalize, first, Observable, tap } from 'rxjs';
import { dutyActions } from '@shared-store/duty-store/duty.actions';

const loading: WritableSignal<boolean> = signal(false);

export const dutiesResolver: ResolveFn<boolean> = (
	_route: ActivatedRouteSnapshot,
	_state: RouterStateSnapshot,
	store: Store = inject(Store),
): Observable<boolean> => {
	return store.select(selectAllDutiesLoaded).pipe(
		tap((areLoaded) => {
			if (!loading() && !areLoaded) {
				loading.set(true);

				store.dispatch(dutyActions.getDutiesWithoutDates());
			}
		}),
		filter((areLoaded) => areLoaded),
		first(),
		finalize(() => loading.set(false)),
	);
};
