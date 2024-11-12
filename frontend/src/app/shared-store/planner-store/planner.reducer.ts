import { createEntityAdapter } from '@ngrx/entity';
import { PlannerDto } from 'src/api/models';
import { comparePlanners } from './compare-planner';
import { PlannerState } from './planner.state';
import { createFeature, createReducer, on } from '@ngrx/store';
import { plannerActions } from './planner.actions';

export const plannerAdapter = createEntityAdapter<PlannerDto>({
	sortComparer: comparePlanners,
});

const initialPlannerState: PlannerState = plannerAdapter.getInitialState({
	isLoading: false,
	error: null,
	allPlannersLoaded: false,
});

const plannerFeature = createFeature({
	name: 'planner',
	reducer: createReducer(
		initialPlannerState,
		on(plannerActions.savePlanner, (state) => ({
			...state,
			isLoading: true,
		})),
		on(plannerActions.savePlannerSuccess, (state, { planner }) =>
			plannerAdapter.addOne(planner, {
				...state,
				isLoading: false,
				allPlannersLoaded: false,
			}),
		),
		on(plannerActions.savePlannerFailure, (state, { errorMessage }) => ({
			...state,
			isLoading: false,
			error: errorMessage,
		})),
		on(plannerActions.getPlanners, (state) => ({
			...state,
			isLoading: false,
		})),
		on(plannerActions.getPlannersSuccess, (state, { planners }) =>
			plannerAdapter.addMany(planners, {
				...state,
				isLoading: false,
				allPlannersLoaded: true,
			}),
		),
		on(plannerActions.getPlannersFailure, (state, { errorMessage }) => ({
			...state,
			isLoading: false,
			error: errorMessage,
		})),
	),
});

export const {
	name: plannerFeatureKey,
	reducer: plannerReducer,
	selectIsLoading,
	selectError,
	selectAllPlannersLoaded,
} = plannerFeature;

export const { selectAll, selectEntities, selectIds, selectTotal } =
	plannerAdapter.getSelectors();
