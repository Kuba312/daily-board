import { Component, effect, inject, Signal, signal, WritableSignal } from '@angular/core';
import { selectAllDuties } from '@shared-store/duty-store/duty.selectors';
import { Store } from '@ngrx/store';
import HeaderComponent from '@shared/components/header/header.component';
import PlannerBoardComponent from '@shared/components/planner-board/planner-board.component';
import { DateDisplayMode } from '@shared/enums/date-display-mode.enum';
import { DutyDto } from 'src/api/models';

@Component({
	selector: 'app-planner',
	standalone: true,
	imports: [HeaderComponent, PlannerBoardComponent],
	templateUrl: './planner.component.html',
	styleUrl: './planner.component.scss',
})
export default class PlannerComponent {
	private readonly _store: Store = inject(Store);

	readonly DISPLAY_MODE: DateDisplayMode = DateDisplayMode.Weekly;

	dailyBoardDuties: WritableSignal<Map<string, DutyDto[]>> = signal(
		new Map([
			[
				'planner.full-days-names.monday',
				[
					{
						id: 'asdasdasda3412',
						name: 'Matematyka',
						description: '',
						from: '08:00',
						to: '10:30',
						color: 'pink',
					},
					{
						id: 'asdasdasda',
						name: 'Matematyka',
						description: '',
						from: '10:45',
						to: '11:30',
						color: 'red',
					},
				],
			],
			['planner.full-days-names.tuesday', []],
			['planner.full-days-names.wednesday', []],
			[
				'planner.full-days-names.thursday',
				[
					{
						id: 'asdasdasda33',
						name: 'Biologia',
						description: '',
						from: '11:00',
						to: '13:00',
						color: 'red',
					},
				],
			],
			['planner.full-days-names.friday', [{}]],
			['planner.full-days-names.saturday', [{}]],
			[
				'planner.full-days-names.sunday',
				[
					{
						id: 'asdasdasda12',
						name: 'Muzyka',
						description: '',
						from: '14:00',
						to: '16:00',
					},
				],
			],
		]),
	);

	public duties: Signal<DutyDto[]> = this._store.selectSignal(selectAllDuties);

	constructor() {
		effect(() => {
			console.log(this.duties());
			
		})
	}
}
