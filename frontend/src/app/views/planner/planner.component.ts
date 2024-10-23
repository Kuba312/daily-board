import { Component, signal, WritableSignal } from '@angular/core';
import PlannerBoardComponent from '@shared/components/planner-board/planner-board.component';
import HeaderComponent from '@shared/components/header/header.component';
import { DateDisplayMode } from '@shared/enums/date-display-mode.enum';
import { TileBoardDto } from '@models/tile-board-dto';

@Component({
	selector: 'app-planner',
	standalone: true,
	imports: [HeaderComponent, PlannerBoardComponent],
	templateUrl: './planner.component.html',
	styleUrl: './planner.component.scss',
})
export default class PlannerComponent {
	readonly DISPLAY_MODE: DateDisplayMode = DateDisplayMode.Weekly;

	dailyBoardDuties: WritableSignal<Map<string, TileBoardDto[]>> = signal(
		new Map([
			[
				'planner.full-days-names.monday',
				[
					{
						id: 1,
						name: 'Matematyka',
						description: '',
						from: '08:00',
						to: '10:30',
						color: 'pink',
					},
					{
						id: 12,
						name: 'Matematyka',
						description: '',
						from: '10:45',
						to: '11:30',
					},
				],
			],
			['planner.full-days-names.tuesday', []],
			['planner.full-days-names.wednesday', []],
			[
				'planner.full-days-names.thursday',
				[
					{
						id: 4,
						name: 'Biologia',
						description: '',
						from: '11:00',
						to: '13:00',
					},
				],
			],
			['planner.full-days-names.friday', [{}]],
			['planner.full-days-names.saturday', [{}]],
			[
				'planner.full-days-names.sunday',
				[
					{
						id: 7,
						name: 'Muzyka',
						description: '',
						from: '14:00',
						to: '16:00',
					},
				],
			],
		]),
	);
}
