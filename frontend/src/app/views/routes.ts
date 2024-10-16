import { Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'planner',
		pathMatch: 'full',
	},
	{
		path: 'planner',
		loadComponent: () => import('./planner/planner.component'),
	},
	{
		path: 'task-board-add',
		loadComponent: () =>
			import('./task-board-form/task-board-form.component'),
	},
];

export default routes;
