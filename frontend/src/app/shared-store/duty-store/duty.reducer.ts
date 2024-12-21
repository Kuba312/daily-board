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
	loadedPlannersDates: [],
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
			(state, { duties, plannerId }): DutyState =>
				dutyAdapter.addMany(duties, {
					...state,
					isLoading: false,
					loadedPlannerIds: [...state.loadedPlannerIds, plannerId],
				}),
		),
		on(
			dutyActions.getDutiesByPlannerIdFailure,
			(state, { errorMessage }) => ({
				...state,
				isLoading: false,
				error: errorMessage,
			}),
		),
		on(dutyActions.getDutiesByRangeTimeAndPlannerId, (state) => ({
			...state,
			isLoading: true,
		})),
		on(
			dutyActions.getDutiesByRangeTimeAndPlannerIdSuccess,
			(state, { from, to, plannerId, duties }): DutyState => {
				const rangeTime = `${from}-${to}`;

				return dutyAdapter.addMany(duties, {
					...state,
					isLoading: false,
					loadedPlannersDates: state.loadedPlannersDates.some(
						(plannerDate) => plannerId in plannerDate,
					)
						? state.loadedPlannersDates.map((plannerDate) =>
								plannerId in plannerDate
									? {
											[plannerId]: [
												...plannerDate[plannerId],
												...(plannerDate[
													plannerId
												].includes(rangeTime)
													? []
													: [rangeTime]),
											],
									  }
									: plannerDate,
						  )
						: [
								...state.loadedPlannersDates,
								{ [plannerId]: [rangeTime] },
						  ],
				});
			},
		),
		on(
			dutyActions.getDutiesByRangeTimeAndPlannerIdFailure,
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
