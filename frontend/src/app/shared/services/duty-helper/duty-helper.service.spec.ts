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

	it('should group duties by colors with unique names ignoring case and spaces', () => {
		const mockDuties: DutyDto[] = [
			{ id: '1', name: 'Math', color: '#FFB266' },
			{ id: '2', name: 'Math ', color: '#FFB266' },
			{ id: '3', name: 'Math', color: '#E27D60' },
			{ id: '4', name: 'Science', color: '#FFB266' },
			{ id: '5', name: ' SCIENCE', color: '#FFB266' },
			{ id: '6', name: 'History', color: '#E27D60' },
		];

		const groupedDuties = service.groupDutiesNamesByColors(mockDuties);

		expect(groupedDuties.size).toBe(2);

		const color1 = '#FFB266';
		const names1 = groupedDuties.get(color1);
		expect(names1).toBeDefined();
		expect(names1!.length).toBe(2);

		expect(names1).toContain('Math');
		expect(names1).toContain('Science');

		const color2 = '#E27D60';
		const names2 = groupedDuties.get(color2);

		expect(names2).toBeDefined();
		expect(names2!.length).toBe(2);

		expect(names2).toContain('Math');
		expect(names2).toContain('History');
	});
});
