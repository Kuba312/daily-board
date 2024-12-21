import { TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { DateHelperService } from './date-helper.service';
import { YEAR_MOTH_DAY_FORMAT } from '@shared/constants/shared-consts.const';

describe('LocaleDateService', () => {
	let localeDateService: DateHelperService;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot()],
			providers: [DateHelperService],
		})
			.compileComponents()
			.then(() => {
				TestBed.runInInjectionContext(() => {
					localeDateService = TestBed.inject(DateHelperService);
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
		const weekRange = localeDateService.currentWeekRange();
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
		const monthsDaysChunks =
			localeDateService.getMonthsDaysChunksByDate(date);

		expect(monthsDaysChunks).toBeDefined();
		expect(monthsDaysChunks.length).toBeGreaterThan(0);
	});

	it('should get months days chunks by date with empty date', () => {
		const date = '';
		const monthsDaysChunks =
			localeDateService.getMonthsDaysChunksByDate(date);

		expect(monthsDaysChunks).toBeDefined();
		expect(monthsDaysChunks.length).toBe(0);
	});

	it('should convert string to date', () => {
		const date = '2021-12-12T00:00:00.000Z';
		const format = YEAR_MOTH_DAY_FORMAT;
		const dateString = localeDateService.stringToDate(date, format);

		expect(dateString).toEqual(moment(date).format(format));
	});

	it('should split date and time range correctly', () => {
		const dateTimeRange = '2024-12-12, 12:00 - 14:00';
		const [date, fromTime, toTime] =
			localeDateService.splitDateTimeRange(dateTimeRange);

		expect(date).toEqual('2024-12-12');
		expect(fromTime).toEqual('12:00');
		expect(toTime).toEqual('14:00');
	});

	it('should handle invalid date and time range for splitDateTimeRange', () => {
		const invalidDateTimeRange = '2024-12-12';
		expect(() =>
			localeDateService.splitDateTimeRange(invalidDateTimeRange),
		).toThrowError();
	});

	it('should return false for non-overlapping date times', () => {
		const date1 = '2024-12-12, 12:00 - 13:00';
		const date2 = '2024-12-12, 14:00 - 15:00';

		const isOverlapped = localeDateService.isDateTimesOverlapped(
			date1,
			date2,
		);

		expect(isOverlapped).toBe(false);
	});

	it('should return true for overlapping date times', () => {
		const date1 = '2024-12-12, 12:00 - 14:00';
		const date2 = '2024-12-12, 13:00 - 15:00';

		const isOverlapped = localeDateService.isDateTimesOverlapped(
			date1,
			date2,
		);

		expect(isOverlapped).toBe(true);
	});

	it('should return false for date times with different dates', () => {
		const date1 = '2024-12-12, 12:00 - 14:00';
		const date2 = '2024-12-13, 13:00 - 15:00';

		const isOverlapped = localeDateService.isDateTimesOverlapped(
			date1,
			date2,
		);

		expect(isOverlapped).toBe(false);
	});

	it('should handle edge case where time ranges barely overlap', () => {
		const date1 = '2024-12-12, 12:00 - 13:00';
		const date2 = '2024-12-12, 13:00 - 14:00';

		const isOverlapped = localeDateService.isDateTimesOverlapped(
			date1,
			date2,
		);

		expect(isOverlapped).toBe(false);
	});

	it('should handle identical date and time ranges as overlapping', () => {
		const date1 = '2024-12-12, 12:00 - 13:00';
		const date2 = '2024-12-12, 12:00 - 13:00';

		const isOverlapped = localeDateService.isDateTimesOverlapped(
			date1,
			date2,
		);

		expect(isOverlapped).toBe(true);
	});

	it('should handle invalid time formats gracefully for isDateTimesOverlapped', () => {
		const date1 = '2024-12-12, 12:00 - invalid';
		const date2 = '2024-12-12, invalid - 14:00';

		expect(() =>
			localeDateService.isDateTimesOverlapped(date1, date2),
		).toThrowError();
	});
});
