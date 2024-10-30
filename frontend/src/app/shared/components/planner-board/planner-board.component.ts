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
import { TranslateModule } from '@ngx-translate/core';
import { TimeManagerService } from '@shared/services/time-manager/time-manager.service';
import { DutyDto } from 'src/api/models';
import PlannerBoardDaysHeadersComponent from './planner-board-days-headers/planner-board-days-headers.component';
import PlannerBoardTileDutiesComponent from './planner-board-tile-duties/planner-board-tile-duties.component';
import { HiddenPartialHourClassPipe } from './pipes/hidden-partial-hour-class.pipe';

@Component({
	selector: 'app-planner-board',
	standalone: true,
	imports: [
		NgClass,
		TranslateModule,
		PlannerBoardTileDutiesComponent,
		PlannerBoardDaysHeadersComponent,
		HiddenPartialHourClassPipe,
	],
	templateUrl: './planner-board.component.html',
	styles: ':host { display: block; width: 100% }',
})
export default class PlannerBoardComponent {
	private readonly _timeManagerService: TimeManagerService =
		inject(TimeManagerService);

	timelineValues: Signal<readonly ElementRef<HTMLElement>[]> =
		viewChildren<ElementRef<HTMLElement>>('timelineValue');

	dailyBoardDuties: InputSignal<Map<string, DutyDto[]>> =
		input.required<Map<string, DutyDto[]>>();

	public readonly HIDDEN_PARTIAL_HOUR: string = 'hidden-partial-hour';

	timeline: WritableSignal<string[]> = signal<string[]>(
		this._getTimelineValues(),
	);

	private _getTimelineValues(): string[] {
		return this._timeManagerService.alreadyProvidedTimelineValues().length
			? this._timeManagerService.alreadyProvidedTimelineValues()
			: this._timeManagerService.createTimeLineEveryNumOfMinutes(1);
	}

	get keysTileBoard(): string[] {
		return [...this.dailyBoardDuties().keys()];
	}

	get dutiesBoard(): DutyDto[][] {
		return [...this.dailyBoardDuties().values()];
	}
}
