import { TestBed, waitForAsync } from '@angular/core/testing';
import moment from 'moment';
import { TimeManagerService } from './time-manager.service';

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
		const expectedStart = moment('07:00', 'HH:mm');
		const expectedEnd = moment('22:00', 'HH:mm'); // Adjusted to match the expected output
	
		expect(result.length).toBeGreaterThan(0);
		expect(result[0]).toBe(expectedStart.format('HH:mm'));
		expect(result[result.length - 1]).toBe(expectedEnd.format('HH:mm'));
	});

	// Test timeline generation with custom start and end times
	it('should create a timeline with custom start and end times', () => {
		const startTime = '08:00';
		const endTime = '12:00';
		const result = service.createTimeLineEveryNumOfMinutes(startTime, endTime, 30);

		expect(result.length).toBeGreaterThan(0);

		for (let i = 0; i < result.length - 1; i++) {
			const time1 = moment(result[i], 'HH:mm');
			const time2 = moment(result[i + 1], 'HH:mm');

			expect(time2.diff(time1, 'minutes')).toBe(30);
		}
	});

	// Test an empty timeline when start time is after end time
	it('should return an empty timeline if start time is after end time', () => {
		const result = service.createTimeLineEveryNumOfMinutes('23:00', '07:00', 15);
		expect(result.length).toBe(0);
	});

	// Test timeline generation with a custom interval
	it('should create a timeline with a custom interval', () => {
		const result = service.createTimeLineEveryNumOfMinutes('08:00', '10:00', 15);
		expect(result.length).toBeGreaterThan(0);

		for (let i = 0; i < result.length - 1; i++) {
			const time1 = moment(result[i], 'HH:mm');
			const time2 = moment(result[i + 1], 'HH:mm');

			expect(time2.diff(time1, 'minutes')).toBe(15);
		}
	});

	// Test edge case for overlapping end time
	it('should include the last time slot up to the end time', () => {
		const result = service.createTimeLineEveryNumOfMinutes('08:00', '08:15', 15);
		expect(result).toEqual(['08:00', '08:15']);
	});
});
