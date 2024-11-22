import { TestBed } from '@angular/core/testing';
import { DutyHelperService } from './duty-helper.service';
import { signal } from '@angular/core';
import { DutyDto } from 'src/api/models';
import { WeekDays } from '@app/enums/week-days.enum';

describe('DutyHelperService', () => {
	let service: DutyHelperService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(DutyHelperService);
	});

	it('should create the service', () => {
		expect(service).toBeTruthy();
	});

	it('should group duties by days correctly', () => {
		const mockDuties = signal<DutyDto[]>([
			{ id: 'asd', weekDay: WeekDays.MONDAY },
			{ id: '3rd1x', weekDay: WeekDays.MONDAY },
			{ id: 'asdf1e23', weekDay: WeekDays.TUESDAY },
			{ id: '212ds12d12d', weekDay: WeekDays.FRIDAY },
		]);

		const groupedDuties = service.groupDutiesByDays(mockDuties);

		expect(
			groupedDuties.get('planner.full-days-names.monday')?.length,
		).toBe(2);
		expect(
			groupedDuties.get('planner.full-days-names.tuesday')?.length,
		).toBe(1);
		expect(
			groupedDuties.get('planner.full-days-names.friday')?.length,
		).toBe(1);
		expect(
			groupedDuties.get('planner.full-days-names.wednesday')?.length,
		).toBe(0);
		expect(
			groupedDuties.get('planner.full-days-names.saturday')?.length,
		).toBe(0);
		expect(
			groupedDuties.get('planner.full-days-names.sunday')?.length,
		).toBe(0);
	});

	it('should return correct key for a duty based on the weekday', () => {
		const mockDuty: DutyDto = { id: 'asd', weekDay: WeekDays.MONDAY };
		const key = service['getDutyKey'](mockDuty);

		expect(key).toBe('planner.full-days-names.monday');
	});

	it('should initialize week days for board correctly', () => {
		const weekDays = service['groupDutiesByDays'](signal<DutyDto[]>([]));

		expect(weekDays.has('planner.full-days-names.monday')).toBeTruthy();
		expect(weekDays.has('planner.full-days-names.tuesday')).toBeTruthy();
		expect(weekDays.has('planner.full-days-names.wednesday')).toBeTruthy();
		expect(weekDays.has('planner.full-days-names.thursday')).toBeTruthy();
		expect(weekDays.has('planner.full-days-names.friday')).toBeTruthy();
		expect(weekDays.has('planner.full-days-names.saturday')).toBeTruthy();
		expect(weekDays.has('planner.full-days-names.sunday')).toBeTruthy();
	});

	it('should create an array of duties based on given week days', () => {
		const mockDuty: DutyDto = {
			id: 'duty-123',
			weekDay: WeekDays.MONDAY,
			name: 'Mock Duty',
		};
		const days: WeekDays[] = [
			WeekDays.MONDAY,
			WeekDays.TUESDAY,
			WeekDays.FRIDAY,
		];

		const result = service.crateArrayOfDutiesBasedOnWeekDays(
			days,
			mockDuty,
		);

		expect(result.length).toBe(days.length);
		expect(result[0]).toEqual({ ...mockDuty, weekDay: WeekDays.MONDAY });
		expect(result[1]).toEqual({ ...mockDuty, weekDay: WeekDays.TUESDAY });
		expect(result[2]).toEqual({ ...mockDuty, weekDay: WeekDays.FRIDAY });
	});
});
