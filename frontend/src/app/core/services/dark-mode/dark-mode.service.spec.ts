import { TestBed, waitForAsync } from '@angular/core/testing';
import { PersistenceService } from '../persistance/persistance.service';
import { DarkModeService } from './dark-mode.service';
import { DARK_MODE_KEY } from '@core/app.consts';

describe('DarkModeService', () => {
	let darkModeService: DarkModeService;
	let persistanceService: PersistenceService;
	let persistanceServiceSpy: jasmine.SpyObj<PersistenceService>;

	beforeEach(waitForAsync(() => {
		persistanceServiceSpy = jasmine.createSpyObj('PersistanceService', [
			'get',
			'set',
		]);

		TestBed.configureTestingModule({
			providers: [
				DarkModeService,
				{ provide: PersistenceService, useValue: persistanceServiceSpy },
			],
		})
			.compileComponents()
			.then(() => {
				darkModeService = TestBed.inject(DarkModeService);
				persistanceService = TestBed.inject(PersistenceService);
			});
	}));

	it('should toggle dark mode', () => {
		persistanceServiceSpy.get.and.returnValue('false');
		darkModeService.toggleDarkMode();

		expect(persistanceService.set).toHaveBeenCalledWith(DARK_MODE_KEY, true)
	})
});
