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
});

const dutyFeature = createFeature({
	name: 'duty',
	reducer: createReducer(
		initialDutyState,
		on(dutyActions.saveDuty, (state) => ({
			...state,
			isLoading: true,
		})),
		on(dutyActions.saveDutySuccess, (state, { duty }) =>
			dutyAdapter.addOne(duty, {
				...state,
				isLoading: false,
				allDutiesLoaded: false,
			}),
		),
		on(dutyActions.saveDutyFailure, (state, { errorMessage }) => ({
			...state,
			isLoading: false,
			error: errorMessage,
		})),
	),
});

export const {
	name: dutyFeatureKey,
	reducer: dutyReducer,
	selectIsLoading,
	selectError,
} = dutyFeature;

export const { selectAll, selectEntities, selectIds, selectTotal } =
	dutyAdapter.getSelectors();
