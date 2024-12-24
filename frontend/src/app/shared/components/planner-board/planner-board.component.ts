import { NgClass } from '@angular/common';
import {
	Component,
	computed,
	ElementRef,
	inject,
	input,
	InputSignal,
	output,
	OutputEmitterRef,
	Signal,
	viewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Nullable, Option } from '@core/types/basics.types';
import { PLANNER_ID } from '@shared/constants/shared-consts.const';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { TranslateModule } from '@ngx-translate/core';
import { TimeManagerService } from '@shared/services/time-manager/time-manager.service';
import { DutyDto, PlannerDto } from 'src/api/models';
import { HiddenPartialHourClassPipe } from './pipes/hidden-partial-hour-class.pipe';
import PlannerBoardDaysHeadersComponent from './planner-board-days-headers/planner-board-days-headers.component';
import PlannerBoardTileDutiesComponent from './planner-board-tile-duties/planner-board-tile-duties.component';
import { AnimationPlannerDirection } from '@shared/enums/animation-planner-direction.enum';
import { PeriodWeek } from '@shared/models/period-week';

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
	private readonly _routerHelperService: RouterHelperService =
		inject(RouterHelperService);
	private readonly _activateRoute: ActivatedRoute = inject(ActivatedRoute);

	public timelineValues: Signal<readonly ElementRef<HTMLElement>[]> =
		viewChildren<ElementRef<HTMLElement>>('timelineValue');

	public dailyBoardDuties: InputSignal<Map<string, DutyDto[]>> =
		input.required<Map<string, DutyDto[]>>();
	public plannerDetails: InputSignal<Option<PlannerDto>> =
		input.required<Option<PlannerDto>>();
	public isDynamic: InputSignal<boolean> = input.required<boolean>();
	public slidePlannerDirection: InputSignal<Nullable<AnimationPlannerDirection>> =
		input<Nullable<AnimationPlannerDirection>>(null);

	public changedWeekPeriod: OutputEmitterRef<PeriodWeek> =
		output<PeriodWeek>();
	public onPlannerAnimationEnd: OutputEmitterRef<void> = output<void>();

	public readonly HIDDEN_PARTIAL_HOUR: string = 'hidden-partial-hour';

	public readonly plannerId: string =
		this._routerHelperService.getParameterValue(
			this._activateRoute,
			PLANNER_ID,
		);
	public readonly duties: Signal<DutyDto[][]> = computed(() => {
		const planner = this.plannerDetails();

		if (!planner) {
			return [];
		}

		return [...this.dailyBoardDuties().values()];
	});
	public readonly keysTileBoard: Signal<string[]> = computed(() => [
		...this.dailyBoardDuties().keys(),
	]);
	public readonly timeline: Signal<string[]> = computed(() => {
		const planner = this.plannerDetails();

		if (!planner) {
			return [];
		}

		return this._getTimelineValues();
	});

	private _getTimelineValues(): string[] {
		return this._timeManagerService.createTimeLineEveryNumOfMinutes(
			this.plannerDetails()?.startTime,
			this.plannerDetails()?.endTime,
			1,
		);
	}
}
