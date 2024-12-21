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
): MemoizedSelector<object, DutyDto[]> =>
	createSelector(selectAllDuties, (duties) =>
		duties.filter((duty) => duty.plannerId === plannerId),
	);

export const isPlannerLoaded = (
	plannerId: string,
	from?: string,
	to?: string,
): MemoizedSelector<object, boolean> =>
	{

		return createSelector(
			selectDutiesState,
			(state: DutyState) => state.loadedPlannerIds.includes(plannerId) ||
			(
				(from &&
					to &&
					state.loadedPlannersDates.find(
						(rangeTimes) => plannerId in rangeTimes,
					)?.[plannerId]) ||
				[]
			).includes(`${from}-${to}`),
		);
	};
