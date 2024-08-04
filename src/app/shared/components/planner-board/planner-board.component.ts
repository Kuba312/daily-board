import { NgClass } from '@angular/common';
import {
	Component,
	ElementRef,
	inject,
	input,
	InputSignal,
	Signal,
	signal,
	viewChildren,
	WritableSignal,
} from '@angular/core';
import { TileBoardDto } from '@models/tile-board-dto';
import { TranslateModule } from '@ngx-translate/core';
import { TimeManagerService } from '@shared/services/time-manager/time-manager.service';
import PlannerBoardDaysHeadersComponent from './planner-board-days-headers/planner-board-days-headers.component';
import PlannerBoardTileDutiesComponent from './planner-board-tile-duties/planner-board-tile-duties.component';

@Component({
	selector: 'app-planner-board',
	standalone: true,
	imports: [
		NgClass,
		TranslateModule,
		PlannerBoardTileDutiesComponent,
		PlannerBoardDaysHeadersComponent,
	],
	templateUrl: './planner-board.component.html',
	styles: ':host { display: block; width: 100% }',
})
export default class PlannerBoardComponent {
	private readonly _timeManagerService: TimeManagerService =
		inject(TimeManagerService);

	timelineValues: Signal<readonly ElementRef<HTMLElement>[]> =
		viewChildren<ElementRef<HTMLElement>>('timelineValue');

	dailyBoardDuties: InputSignal<Map<string, TileBoardDto[]>> = input.required<
		Map<string, TileBoardDto[]>
	>();

	private readonly HIDDEN_PARTIAL_HOUR: string = 'hidden-partial-hour';

	timeline: WritableSignal<string[]> = signal<string[]>(
		this._timeManagerService.createTimeLineEveryNumOfMinutes(5),
	);

	applyHiddenPartialHourClass(time: string): Record<string, boolean> {
		const isPartialHour = this.isPartialHour(time);

		return {
			[this.HIDDEN_PARTIAL_HOUR]: isPartialHour,
		};
	}

	isPartialHour(time: string): boolean {
		const splittedTime = time.split(':');

		return splittedTime[1] !== '00';
	}

	get keysTileBoard(): string[] {
		return [...this.dailyBoardDuties().keys()];
	}

	get dutiesBoard(): TileBoardDto[][] {
		return [...this.dailyBoardDuties().values()];
	}
}
