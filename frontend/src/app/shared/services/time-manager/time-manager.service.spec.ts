import { TestBed, waitForAsync } from '@angular/core/testing';
import moment from 'moment';
import { TimeManagerService } from './time-manager.service';
import { TIME_FORMAT } from '@app/shared/constants/shared-consts.const';

describe('TimeManagerService', () => {
	let service: TimeManagerService;

	// Initialize the service before each test using waitForAsync
	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			providers: [TimeManagerService],
		});

		service = TestBed.inject(TimeManagerService);
	}));

	it('should create a timeline with default start and end times', () => {
		const result = service.createTimeLineEveryNumOfMinutes(undefined, undefined, 15);
		const expectedStart = moment('07:00', TIME_FORMAT);
		const expectedEnd = moment('22:00', TIME_FORMAT);
	
		expect(result.length).toBeGreaterThan(0);
		expect(result[0]).toBe(expectedStart.format(TIME_FORMAT));
		expect(result[result.length - 1]).toBe(expectedEnd.format(TIME_FORMAT));
	});

	it('should create a timeline with custom start and end times', () => {
		const startTime = '08:00';
		const endTime = '12:00';
		const result = service.createTimeLineEveryNumOfMinutes(startTime, endTime, 30);

		expect(result.length).toBeGreaterThan(0);

		for (let i = 0; i < result.length - 1; i++) {
			const time1 = moment(result[i], TIME_FORMAT);
			const time2 = moment(result[i + 1], TIME_FORMAT);

			expect(time2.diff(time1, 'minutes')).toBe(30);
		}
	});

	it('should return an empty timeline if start time is after end time', () => {
		const result = service.createTimeLineEveryNumOfMinutes('23:00', '07:00', 15);
		expect(result.length).toBe(0);
	});

	it('should create a timeline with a custom interval', () => {
		const result = service.createTimeLineEveryNumOfMinutes('08:00', '10:00', 15);
		expect(result.length).toBeGreaterThan(0);

		for (let i = 0; i < result.length - 1; i++) {
			const time1 = moment(result[i], TIME_FORMAT);
			const time2 = moment(result[i + 1], TIME_FORMAT);

			expect(time2.diff(time1, 'minutes')).toBe(15);
		}
	});

	it('should include the last time slot up to the end time', () => {
		const result = service.createTimeLineEveryNumOfMinutes('08:00', '08:15', 15);
		expect(result).toEqual(['08:00', '08:15']);
	});
});
