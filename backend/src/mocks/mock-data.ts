import { ElementRef } from '@angular/core';
import { TileBoardDto } from '@models/tile-board-dto';
import { WeekRange } from '@shared/models/week-range';

export const WEEK_RANGE_MOCK: WeekRange = {
	startOfWeek: '2024-07-21T22:00:00.000Z',
	endOfWeek: '2024-07-28T21:59:59.999Z',
};

export const DUTIES_MOCK: Map<string, TileBoardDto[]> = new Map<
	string,
	TileBoardDto[]
>([
	[
		'planner.full-days-names.monday',
		[
			{
				id: 1,
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

export const TILE_BOARD_DUTIES_MOCK: TileBoardDto[][] = [
	[
		{
			id: 1,
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
