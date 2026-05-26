import { inject, signal, WritableSignal } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { plannerActions } from "@shared-store/planner-store/planner.actions";
import {
	selectAllPlannersLoaded,
	selectError,
} from "@shared-store/planner-store/planner.reducer";
import { Store } from "@ngrx/store";
import { combineLatest, filter, finalize, first, map, Observable, tap } from "rxjs";

const loading: WritableSignal<boolean> = signal(false);

export const plannersResolver: ResolveFn<boolean> = (
	_route: ActivatedRouteSnapshot,
	_state: RouterStateSnapshot,
	store: Store = inject(Store),
): Observable<boolean> => {
	return combineLatest([
		store.select(selectAllPlannersLoaded),
		store.select(selectError),
	]).pipe(
		tap(([areLoaded]) => {
			if(!loading() && !areLoaded) {
				loading.set(true);

				store.dispatch(plannerActions.getPlanners());
			}
		}),
		filter(([areLoaded, error]) => areLoaded || !!error),
		first(),
		map(([areLoaded]) => areLoaded),
		finalize(() => loading.set(false)),
	)
}
