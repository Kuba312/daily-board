import { TestBed, waitForAsync } from '@angular/core/testing';
import {
	TranslateModule,
} from '@ngx-translate/core';
import moment from 'moment';
import { LocaleDateService } from './locale-date.service';
import { YEAR_MOTH_DAY_FORMAT } from '@shared/constants/shared-consts.const';

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
		const currentDate = moment().format(YEAR_MOTH_DAY_FORMAT);
		const currentDay = localeDateService.getCurrentDay();
		const splittedCurrentDay = currentDay.split('T')[0];

		expect(splittedCurrentDay).toEqual(currentDate);
	});

	it('should extract day from date', () => {
		const date = '2021-12-12T00:00:00.000Z';
		const day = localeDateService.extractDayFromDate(date, true);

		expect(day).toEqual('12');
	});

	it('should extract day from date from not chosen date', () => {
		const date = '2021-12-11T00:00:00.000Z';
		const day = localeDateService.extractDayFromDate(date, false);

		expect(day).toEqual('11');
	});

	it('should return week range', () => {
		const weekRange = localeDateService.weekRange();
		const startOfWeek = moment().startOf('week').toISOString();
		const endOfWeek = moment().endOf('week').toISOString();

		expect(weekRange.startOfWeek).toEqual(startOfWeek);
		expect(weekRange.endOfWeek).toEqual(endOfWeek);
	});

	it('should return locale date format', () => {
		const localeDateFormat = localeDateService.localeDateFormat();

		expect(localeDateFormat).toEqual('pl');
	});

	it('should get months days chunks by date', () => {
		const date = '2021-12-12T00:00:00.000Z';
		const monthsDaysChunks = localeDateService.getMonthsDaysChunksByDate(date);

		expect(monthsDaysChunks).toBeDefined();
		expect(monthsDaysChunks.length).toBeGreaterThan(0);
	});

	it('should get months days chunks by date with empty date', () => {
		const date = '';
		const monthsDaysChunks = localeDateService.getMonthsDaysChunksByDate(date);

		expect(monthsDaysChunks).toBeDefined();
		expect(monthsDaysChunks.length).toBe(0);
	});

	it('should convert string to date', () => {
		const date = '2021-12-12T00:00:00.000Z';
		const format = YEAR_MOTH_DAY_FORMAT;
		const dateString = localeDateService.stringToDate(date, format);

		expect(dateString).toEqual(moment(date).format(format));
	});
});
