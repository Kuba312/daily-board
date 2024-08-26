import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterHelperService } from './router-helper.service';
import { IsActiveMatchOptions, Router } from '@angular/router';

describe('RouterHelperService', () => {
	let routerHelperService: RouterHelperService;
	let router: Router;
	let routerSpy: jasmine.SpyObj<Router>;

	beforeEach(waitForAsync(() => {
		routerSpy = jasmine.createSpyObj('Router', ['isActive']);

		TestBed.configureTestingModule({
			providers: [
				RouterHelperService,
				{
					provide: Router,
					useValue: routerSpy,
				},
			],
		})
			.compileComponents()
			.then(() => {
				TestBed.runInInjectionContext(() => {
					routerHelperService = TestBed.inject(RouterHelperService);
					router = TestBed.inject(Router);
				});
			});
	}));

	it('should call isActive when the path is checked', () => {
		routerHelperService.isActive('/planner');

		expect(router.isActive).toHaveBeenCalled();
	});

	it('should call isActive with the correct link and options', () => {
		const link = '/planner';
		const options: IsActiveMatchOptions = {
			paths: 'exact',
			queryParams: 'exact',
			fragment: 'ignored',
			matrixParams: 'ignored',
		};

		routerHelperService.isActive(link);

		expect(routerSpy.isActive).toHaveBeenCalledWith(link, options);
	});

	it('should return true if Router.isActive returns true', () => {
		const link = '/planner';

		routerSpy.isActive.and.returnValue(true);

		const result = routerHelperService.isActive(link);

		expect(result).toBe(true);
	});

	it('should return false if Router.isActive returns false', () => {
		const link = '/planner';

		routerSpy.isActive.and.returnValue(false);

		const result = routerHelperService.isActive(link);

		expect(result).toBe(false);
	});
});
