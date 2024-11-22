import { createEntityAdapter } from '@ngrx/entity';
import { DutyDto } from 'src/api/models';
import { compareDuties } from './compare-duties';
import { DutyState } from './duty.state';
import { createFeature, createReducer, on } from '@ngrx/store';
import { dutyActions } from './duty.actions';

export const dutyAdapter = createEntityAdapter<DutyDto>({
	sortComparer: compareDuties,
});

const initialDutyState: DutyState = dutyAdapter.getInitialState({
	isLoading: false,
	error: null,
	allDutiesLoaded: false,
	loadedPlannerIds: [],
});

const dutyFeature = createFeature({
	name: 'duty',
	reducer: createReducer(
		initialDutyState,
		on(dutyActions.saveDuty, (state) => ({
			...state,
			isLoading: true,
		})),
		on(dutyActions.saveDutySuccess, (state, { duties, plannerId }) =>
			dutyAdapter.addMany(duties, {
				...state,
				isLoading: false,
				allDutiesLoaded: false,
				loadedPlannerIds: [
					...state.loadedPlannerIds.filter(
						(loadedPlannerId) => loadedPlannerId !== plannerId,
					),
				],
			}),
		),
		on(dutyActions.saveDutyFailure, (state, { errorMessage }) => ({
			...state,
			isLoading: false,
			error: errorMessage,
		})),
		on(dutyActions.getDutiesWithoutDates, (state) => ({
			...state,
			isLoading: true,
		})),
		on(dutyActions.getDutiesWithoutDatesSuccess, (state, { duties }) =>
			dutyAdapter.addMany(duties, {
				...state,
				isLoading: false,
				allDutiesLoaded: true,
			}),
		),
		on(
			dutyActions.getDutiesWithoutDatesFailure,
			(state, { errorMessage }) => ({
				...state,
				isLoading: false,
				error: errorMessage,
			}),
		),
		on(dutyActions.getDutiesByPlannerId, (state) => ({
			...state,
			isLoading: true,
		})),
		on(
			dutyActions.getDutiesByPlannerIdSuccess,
			(state, { duties, plannerId }): DutyState => {
				return dutyAdapter.addMany(duties, {
					...state,
					isLoading: false,
					loadedPlannerIds: [...state.loadedPlannerIds, plannerId],
				});
			},
		),
		on(
			dutyActions.getDutiesByPlannerIdFailure,
			(state, { errorMessage }) => ({
				...state,
				isLoading: false,
				error: errorMessage,
			}),
		),
	),
});

export const {
	name: dutyFeatureKey,
	reducer: dutyReducer,
	selectIsLoading,
	selectError,
	selectAllDutiesLoaded,
} = dutyFeature;

export const { selectAll, selectEntities, selectIds, selectTotal } =
	dutyAdapter.getSelectors();
