import { of } from 'rxjs';

export const ACTIVATED_ROUTE_PROVIDER = {
	params: of({}),
	queryParams: of({}),
	snapshot: {
		paramMap: {
			get(): string {
				return '123';
			},
		},
	},
};

export const ROUTER_MOCK = {
	url: '/planner',
	events: of({}),
	navigate: jasmine.createSpy('navigate'),
	createUrlTree: jasmine.createSpy('createUrlTree'),
	serializeUrl: jasmine.createSpy('serializeUrl'),
  };