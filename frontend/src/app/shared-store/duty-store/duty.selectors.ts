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

export const selectDutiesByPlannerIdAndRangeTime = (
	plannerId: string,
	from: string,
	to: string,
): MemoizedSelector<object, DutyDto[]> =>
	createSelector(selectAllDuties, (duties) =>
		duties.filter(
			(duty) =>
				duty.plannerId === plannerId &&
				duty.effectiveDate &&
				duty.effectiveDate >= from &&
				duty.effectiveDate <= to,
		),
	);

export const isTimeRangePlannerLoaded = (
	plannerId: string,
	from: string,
	to: string,
): MemoizedSelector<object, boolean> =>
	createSelector(
		selectDutiesState,
		({ loadedPlannersDates }) =>
			loadedPlannersDates
				.find((rangeTimes) => plannerId in rangeTimes)
				?.[plannerId]?.includes(`${from}-${to}`) ?? false,
	);

export const isPlannerLoaded = (
	plannerId: string,
	from?: string,
	to?: string,
): MemoizedSelector<object, boolean> =>
	createSelector(
		selectDutiesState,
		(state: DutyState) =>
			state.loadedPlannerIds.includes(plannerId) ||
			(
				(from &&
					to &&
					state.loadedPlannersDates.find(
						(rangeTimes) => plannerId in rangeTimes,
					)?.[plannerId]) ||
				[]
			).includes(`${from}-${to}`),
	);
