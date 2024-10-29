import { ElementRef } from '@angular/core';
import {
	AbstractControl,
	AsyncValidatorFn,
	ValidationErrors,
} from '@angular/forms';
import { WeekDays } from '@app/enums/week-days.enum';
import { WeekRange } from '@shared/models/week-range';
import { delay, Observable, of } from 'rxjs';
import { DutyDto } from 'src/api/models';

export const WEEK_RANGE_MOCK: WeekRange = {
	startOfWeek: '2024-07-21T22:00:00.000Z',
	endOfWeek: '2024-07-28T21:59:59.999Z',
};

export const DUTIES_MOCK: Map<string, DutyDto[]> = new Map<
	string,
	DutyDto[]
>([
	[
		'planner.full-days-names.monday',
		[
			{
				id: 'asdasdasd',
				name: 'Matematyka',
				description: '',
				from: '08:00',
				to: '10:00',
			},
		],
	],
	['planner.full-days-names.tuesday', []],
	['planner.full-days-names.wednesday', []],
	['planner.full-days-names.thursday', []],
	['planner.full-days-names.friday', []],
	['planner.full-days-names.saturday', []],
	['planner.full-days-names.sunday', []],
]);

export const TILE_BOARD_DUTIES_MOCK: DutyDto[][] = [
	[
		{
			id: 'asdasd',
			name: 'Matematyka',
			description: '',
			from: '08:00',
			to: '10:00',
		},
	],
];

const parentElement = document.createElement('div');
Object.defineProperty(parentElement, 'offsetTop', { value: 170 });

const mockElement1 = document.createElement('div');
Object.defineProperty(mockElement1, 'id', { value: '08:00' });
Object.defineProperty(mockElement1, 'offsetTop', { value: 301 });

const mockElement2: HTMLElement = document.createElement('div');
Object.defineProperty(mockElement2, 'id', { value: '10:00' });
Object.defineProperty(mockElement2, 'offsetTop', { value: 422 });

parentElement.append(mockElement1, mockElement2);

const MOCK_ELEMENT_REF_1 = new ElementRef(mockElement1);
const MOCK_ELEMENT_REF_2 = new ElementRef(mockElement2);

export const MOCK_HTML_ELEMENTS: ElementRef<HTMLElement>[] = [
	MOCK_ELEMENT_REF_1,
	MOCK_ELEMENT_REF_2,
];

export const WEEKDAYS_MOCK: string[] = [
	'planner.full-days-names.monday',
	'planner.full-days-names.tuesday',
	'planner.full-days-names.wednesday',
	'planner.full-days-names.thursday',
	'planner.full-days-names.friday',
	'planner.full-days-names.saturday',
	'planner.full-days-names.sunday',
];

export function asyncMockValidator(): AsyncValidatorFn {
	return (control: AbstractControl): Observable<ValidationErrors | null> => {
		return of(
			control.value === 'valid' ? null : { invalidAsync: true },
		).pipe(delay(1000));
	};
}

export const MOCK_CHUNKS_DAYS = [
	[
		'',
		{ date: '2024-10-01', day: '01' },
		{ date: '2024-10-02', day: '02' },
		{ date: '2024-10-03', day: '03' },
		{ date: '2024-10-04', day: '04' },
		{ date: '2024-10-05', day: '05' },
		{ date: '2024-10-06', day: '06' },
	],
	[
		{ date: '2024-10-07', day: '07' },
		{ date: '2024-10-08', day: '08' },
		{ date: '2024-10-09', day: '09' },
		{ date: '2024-10-10', day: '10' },
		{ date: '2024-10-11', day: '11' },
		{ date: '2024-10-12', day: '12' },
		{ date: '2024-10-13', day: '13' },
	],
	[
		{ date: '2024-10-14', day: '14' },
		{ date: '2024-10-15', day: '15' },
		{ date: '2024-10-16', day: '16' },
		{ date: '2024-10-17', day: '17' },
		{ date: '2024-10-18', day: '18' },
		{ date: '2024-10-19', day: '19' },
		{ date: '2024-10-20', day: '20' },
	],
	[
		{ date: '2024-10-21', day: '21' },
		{ date: '2024-10-22', day: '22' },
		{ date: '2024-10-23', day: '23' },
		{ date: '2024-10-24', day: '24' },
		{ date: '2024-10-25', day: '25' },
		{ date: '2024-10-26', day: '26' },
		{ date: '2024-10-27', day: '27' },
	],
	[
		{ date: '2024-10-28', day: '28' },
		{ date: '2024-10-29', day: '29' },
		{ date: '2024-10-30', day: '30' },
		{ date: '2024-10-31', day: '31' },
	],
];

export const MOCK_DAY_OPTIONS = Object.values(WeekDays).map((val) =>
	val.toLowerCase(),
);
