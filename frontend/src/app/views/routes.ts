import { Routes } from '@angular/router';
import { plannersResolver } from '@app/resolvers/planners.resolver';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import {
	dutyFeatureKey,
	dutyReducer,
} from '@shared-store/duty-store/duty.reducer';
import {
	plannerFeatureKey,
	plannerReducer,
} from '@shared-store/planner-store/planner.reducer';
import * as dutyEffects from '../shared-store/duty-store/duty.effects';
import * as plannerEffects from '../shared-store/planner-store/planner.effects';
import { dutiesResolver } from './planner/duties.resolver';
import { authGuard } from '@core/auth/auth.guard';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'planners',
		pathMatch: 'full',
	},
		{
			path: 'auth',
			loadComponent: () => import('./auth/auth.component'),
		},
		{
			path: 'planners/:plannerId/:isDynamic',
			loadComponent: () => import('./planner/planner.component'),
			canActivate: [authGuard],
			providers: [
			provideState(plannerFeatureKey, plannerReducer),
			provideState(dutyFeatureKey, dutyReducer),
			provideEffects(dutyEffects),
			provideEffects(plannerEffects),
		],
		resolve: {
			duties: dutiesResolver,
		},
	},
		{
			path: 'planners',
			loadComponent: () => import('./planners-dashboard/planners-dashboard.component'),
			canActivate: [authGuard],
			providers: [
			provideState(plannerFeatureKey, plannerReducer),
			provideEffects(plannerEffects),
		],
		resolve: {
			planners: plannersResolver,
		},
	},
		{
			path: 'choose-planner',
			loadComponent: () =>
				import('./task-planner-chooser/task-planner-chooser.component'),
			canActivate: [authGuard],
			providers: [
			provideState(plannerFeatureKey, plannerReducer),
			provideEffects(plannerEffects),
		],
		resolve: {
			planners: plannersResolver,
		},
	},
		{
			path: 'task-board-add/:plannerId',
			loadComponent: () =>
				import('./task-board-form/task-board-form.component'),
			canActivate: [authGuard],
			providers: [
			provideState(dutyFeatureKey, dutyReducer),
			provideState(plannerFeatureKey, plannerReducer),
			provideEffects(dutyEffects),
			provideEffects(plannerEffects),
		],
	},
		{
			path: 'planner-add',
			loadComponent: () => import('./planner-form/planner-form.component'),
			canActivate: [authGuard],
			providers: [
			provideState(plannerFeatureKey, plannerReducer),
			provideEffects(plannerEffects),
		],
	},
];

export default routes;
