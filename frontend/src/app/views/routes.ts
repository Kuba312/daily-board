import { Routes } from '@angular/router';
import {
	dutyFeatureKey,
	dutyReducer,
} from '@shared-store/duty-store/duty.reducer';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import * as dutyEffects from '../shared-store/duty-store/duty.effects';
import * as plannerEffects from '../shared-store/planner-store/planner.effects';
import { dutiesResolver } from './planner/duties.resolver';
import {
	plannerFeatureKey,
	plannerReducer,
} from '@app/shared-store/planner-store/planner.reducer';
import { plannersResolver } from '@app/resolvers/planners.resolver';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'planners',
		pathMatch: 'full',
	},
	{
		path: 'planners',
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
		path: 'choose-planner',
		loadComponent: () =>
			import('./task-planner-chooser/task-planner-chooser.component'),
		providers: [
			provideState(plannerFeatureKey, plannerReducer),
			provideEffects(plannerEffects),
		],
		resolve: {
			planners: plannersResolver,
		},
	},
	{
		path: 'task-board-add/:plannerId/:isConstant',
		loadComponent: () =>
			import('./task-board-form/task-board-form.component'),
		providers: [
			provideState(dutyFeatureKey, dutyReducer),
			provideEffects(dutyEffects),
		],
	},
	{
		path: 'planner-add',
		loadComponent: () => import('./planner-form/planner-form.component'),
		providers: [
			provideState(plannerFeatureKey, plannerReducer),
			provideEffects(plannerEffects),
		],
	},
];

export default routes;
