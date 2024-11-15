import {
	createFeatureSelector,
	createSelector,
	MemoizedSelector,
} from '@ngrx/store';
import { DutyState } from './duty.state';
import { selectAll } from './duty.reducer';
import { DutyDto } from 'src/api/models';

export const selectDutiesState = createFeatureSelector<DutyState>('duty');

export const selectAllDuties = createSelector(selectDutiesState, selectAll);

export const selectDutiesByPlannerId = (
	plannerId: string,
): MemoizedSelector<object, DutyDto[]> => {
	return createSelector(selectAllDuties, (duties) =>
		duties.filter((duty) => duty.plannerId === plannerId),
	);
};

export const isPlannerLoaded = (
	plannerId: string,
): MemoizedSelector<object, boolean> =>
	createSelector(selectDutiesState, (state: DutyState) =>
		state.loadedPlannerIds.includes(plannerId),
	);
