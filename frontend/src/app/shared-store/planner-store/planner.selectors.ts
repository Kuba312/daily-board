import {
	createFeatureSelector,
	createSelector,
	MemoizedSelector,
} from '@ngrx/store';
import { PlannerDto } from 'src/api/models';
import { selectAll } from './planner.reducer';
import { PlannerState } from './planner.state';

export const selectPlannersState =
	createFeatureSelector<PlannerState>('planner');

export const selectAllPlanners = createSelector(selectPlannersState, selectAll);

export const selectPlannerById = (
	plannerId: string,
): MemoizedSelector<object, PlannerDto | undefined> => {
	return createSelector(
		selectPlannersState,
		({ entities }) => entities[plannerId],
	);
};
