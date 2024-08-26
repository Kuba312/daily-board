import { TestBed, waitForAsync } from '@angular/core/testing';
import {
	TranslateModule,
} from '@ngx-translate/core';
import moment from 'moment';
import { LocaleDateService } from './locale-date.service';

describe('LocaleDateService', () => {
	let localeDateService: LocaleDateService;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot()],
			providers: [
				LocaleDateService,
			],
		})
			.compileComponents()
			.then(() => {
				TestBed.runInInjectionContext(() => {
					localeDateService = TestBed.inject(LocaleDateService);
				});
			});
	}));

	it('should return current day', () => {
		const currentDate = moment().format('YYYY-MM-DD');
		const currentDay = localeDateService.currentDay();
		const splittedCurrentDay = currentDay.split('T')[0];

		expect(splittedCurrentDay).toEqual(currentDate);
	});
});
