import { TestBed, waitForAsync } from '@angular/core/testing';
import { PersistanceService } from '../persistance/persistance.service';
import { DarkModeService } from './dark-mode.service';
import { DARK_MODE_KEY } from '@core/app.consts';

describe('DarkModeService', () => {
	let darkModeService: DarkModeService;
	let persistanceService: PersistanceService;
	let persistanceServiceSpy: jasmine.SpyObj<PersistanceService>;

	beforeEach(waitForAsync(() => {
		persistanceServiceSpy = jasmine.createSpyObj('PersistanceService', [
			'get',
			'set',
		]);

		TestBed.configureTestingModule({
			providers: [
				DarkModeService,
				{ provide: PersistanceService, useValue: persistanceServiceSpy },
			],
		})
			.compileComponents()
			.then(() => {
				darkModeService = TestBed.inject(DarkModeService);
				persistanceService = TestBed.inject(PersistanceService);
			});
	}));

	it('should toggle dark mode', () => {
		persistanceServiceSpy.get.and.returnValue('false');
		darkModeService.toggleDarkMode();

		expect(persistanceService.set).toHaveBeenCalledWith(DARK_MODE_KEY, true)
	})
});
