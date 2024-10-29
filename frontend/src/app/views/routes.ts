import { Routes } from '@angular/router';
import {
	dutyFeatureKey,
	dutyReducer,
} from '@app/shared-store/duty-store/duty.reducer';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import * as dutyEffects from '../shared-store/duty-store/duty.effects';
import { dutiesResolver } from './planner/planner.resolver';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'planner',
		pathMatch: 'full',
	},
	{
		path: 'planner',
		loadComponent: () => import('./planner/planner.component'),
		providers: [
			provideState(dutyFeatureKey, dutyReducer),
			provideEffects(dutyEffects),
		],
		resolve: {
			duties: dutiesResolver,
		},
	},
	{
		path: 'task-board-add',
		loadComponent: () =>
			import('./task-board-form/task-board-form.component'),
		providers: [
			provideState(dutyFeatureKey, dutyReducer),
			provideEffects(dutyEffects),
		],
	},
];

export default routes;
