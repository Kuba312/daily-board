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
];

export default routes;