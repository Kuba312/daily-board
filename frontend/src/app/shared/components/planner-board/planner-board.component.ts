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
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { notEmpty } from '@core/helpers/not-empty-operator.helper';
import { Nullable, Option } from '@core/types/basics.types';
import { TranslateModule } from '@ngx-translate/core';
import { PLANNER_ID } from '@shared/constants/shared-consts.const';
import { AnimationPlannerDirection } from '@shared/enums/animation-planner-direction.enum';
import { PeriodWeek } from '@shared/models/period-week';
import { TimelineSliderDetails } from '@shared/models/time-slider-details';
import { DateHelperService } from '@shared/services/locale-date/date-helper.service';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { TimeManagerService } from '@shared/services/time-manager/time-manager.service';
import {
	debounceTime,
	distinctUntilChanged,
	fromEvent,
	interval,
	map,
	merge,
	takeWhile,
} from 'rxjs';
import { DutyDto, PlannerDto } from 'src/api/models';
import { HiddenPartialHourClassPipe } from './pipes/hidden-partial-hour-class.pipe';
import PlannerBoardDaysHeadersComponent from './planner-board-days-headers/planner-board-days-headers.component';
import PlannerBoardTileDutiesComponent from './planner-board-tile-duties/planner-board-tile-duties.component';
import TimelineBoardSliderComponent from './timeline-board-slider/timeline-board-slider.component';

@Component({
    selector: 'app-planner-board',
    imports: [
        NgClass,
        TranslateModule,
        PlannerBoardTileDutiesComponent,
        PlannerBoardDaysHeadersComponent,
        HiddenPartialHourClassPipe,
        TimelineBoardSliderComponent,
    ],
    templateUrl: './planner-board.component.html',
    styles: ':host { display: block; width: 100% }',
})
export default class PlannerBoardComponent {
	private readonly _timeManagerService: TimeManagerService =
		inject(TimeManagerService);
	private readonly _dateHelperService: DateHelperService =
		inject(DateHelperService);
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
	public initialWeekIndex: InputSignal<number> = input<number>(0);
	public slidePlannerDirection: InputSignal<
		Nullable<AnimationPlannerDirection>
	> = input<Nullable<AnimationPlannerDirection>>(null);

	public changedWeekPeriod: OutputEmitterRef<PeriodWeek> =
		output<PeriodWeek>();
	public plannerAnimationEnd: OutputEmitterRef<void> = output<void>();
	public editDuty: OutputEmitterRef<DutyDto> = output<DutyDto>();
	public deleteDuty: OutputEmitterRef<DutyDto> = output<DutyDto>();

	public readonly HIDDEN_PARTIAL_HOUR: string = 'hidden-partial-hour';

	private readonly PLANNER_TIME_INTERVALS: number = 1;
	private readonly HEIGHT_OF_VISIBLE_HOUR: number = 15;

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
	public readonly timelineSliderDetails: Signal<
		Option<TimelineSliderDetails>
	> = toSignal(
		merge(
			interval(1000).pipe(
				map(() => this._dateHelperService.getCurrentHour()),
				distinctUntilChanged(),
			),
			fromEvent(window, 'resize').pipe(
				distinctUntilChanged(),
				debounceTime(200),
				map(() => this._dateHelperService.getCurrentHour()),
			),
		).pipe(
			notEmpty(),
			map((currentTime) => ({
				currentTime,
				timeTopPosition: this._calculatePxToRem(
					this._findPositionOnBoardInPx(currentTime) -
					this.HEIGHT_OF_VISIBLE_HOUR,
				),
			})),
			takeWhile(({ timeTopPosition }) => timeTopPosition > 0, false),
		),
	);

	private _findPositionOnBoardInPx(currentTime: string): number {
		return this.timelineValues().find(
			(element) => element.nativeElement.textContent === currentTime,
		)?.nativeElement.offsetTop ?? 0;
	}

	private _calculatePxToRem(px: number): number {
		const fontSize = parseFloat(
			getComputedStyle(document.documentElement).fontSize,
		);

		return px / fontSize;
	}

	private _getTimelineValues(): string[] {
		return this._timeManagerService.createTimeLineEveryNumOfMinutes(
			this.plannerDetails()?.startTime,
			this.plannerDetails()?.endTime,
			this.PLANNER_TIME_INTERVALS,
		);
	}
}
