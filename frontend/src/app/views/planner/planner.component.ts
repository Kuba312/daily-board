import {
	Component,
	computed,
	inject,
	signal,
	Signal,
	WritableSignal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { dutyActions } from '@shared-store/duty-store/duty.actions';
import { AnimationPlannerDirection } from '@shared/enums/animation-planner-direction.enum';
import { PeriodWeek } from '@shared/models/period-week';
import { Nullable, Option } from '@core/types/basics.types';
import { Store } from '@ngrx/store';
import {
	isTimeRangePlannerLoaded,
	selectDutiesByPlannerId,
	selectDutiesByPlannerIdAndRangeTime,
} from '@shared-store/duty-store/duty.selectors';
import { plannerActions } from '@shared-store/planner-store/planner.actions';
import { selectPlannerById } from '@shared-store/planner-store/planner.selectors';
import HeaderComponent from '@shared/components/header/header.component';
import PlannerBoardComponent from '@shared/components/planner-board/planner-board.component';
import {
	DYNAMIC_PLANNER,
	IS_DYNAMIC_PLANNER,
	PLANNER_ID,
} from '@shared/constants/shared-consts.const';
import { DateDisplayMode } from '@shared/enums/date-display-mode.enum';
import SafeValue from '@shared/pipes/safe-value.pipe';
import { DutyHelperService } from '@shared/services/duty-helper/duty-helper.service';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { DutyDto, PlannerDto } from 'src/api/models';

@Component({
	selector: 'app-planner',
	standalone: true,
	imports: [HeaderComponent, PlannerBoardComponent, SafeValue],
	templateUrl: './planner.component.html',
	styleUrl: './planner.component.scss',
})
export default class PlannerComponent {
	private readonly _store: Store = inject(Store);
	private readonly _activateRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly _routerHelperService: RouterHelperService =
		inject(RouterHelperService);
	private readonly _dutyHelperService: DutyHelperService =
		inject(DutyHelperService);

	public readonly DISPLAY_MODE: DateDisplayMode = DateDisplayMode.Weekly;
	public readonly BACK_URL: string = '/planners';

	public readonly plannerId: string =
		this._routerHelperService.getParameterValue(
			this._activateRoute,
			PLANNER_ID,
		);
	public readonly isDynamic: boolean =
		this._routerHelperService.getParameterValue(
			this._activateRoute,
			IS_DYNAMIC_PLANNER,
		) === DYNAMIC_PLANNER;

	public readonly duties: Signal<Map<string, DutyDto[]>> = computed(() =>
		this._getDutiesForCurrentPlanner(this.fromDate(), this.toDate()),
	);

	public readonly plannerDetails: Signal<Option<PlannerDto>> =
		this._store.selectSignal(selectPlannerById(this.plannerId));
	public readonly isPlannerLoaded: Signal<boolean> = computed(
		() => !!this.plannerDetails(),
	);

	public fromDate: WritableSignal<string> = signal(
		this._dutyHelperService.adjustCurrentWeekDatesToYearMonthDayFormat()[0],
	);
	public toDate: WritableSignal<string> = signal(
		this._dutyHelperService.adjustCurrentWeekDatesToYearMonthDayFormat()[1],
	);
	public slidePlannerDirection: WritableSignal<
		Nullable<AnimationPlannerDirection>
	> = signal<Nullable<AnimationPlannerDirection>>(null);

	private _previousWeekIndex: WritableSignal<number> = signal<number>(0);

	public ngOnInit(): void {
		this._loadPlanner();
	}

	public onWeekPeriodChanged(weekPeriod: PeriodWeek): void {
		if(this.slidePlannerDirection()) {
			return;
		}

		const [from, to] = weekPeriod.weekPeriod;
		const currentWeekIndex = weekPeriod.currentWeekIndex;
		const isRangeTimePlannerLoaded = this._store.selectSignal(
			isTimeRangePlannerLoaded(this.plannerId, from, to),
		);

		this._setPlannerAnimationDirection(currentWeekIndex);

		if (!isRangeTimePlannerLoaded()) {
			this._store.dispatch(
				dutyActions.getDutiesByRangeTimeAndPlannerId({
					plannerId: this.plannerId,
					from,
					to,
				}),
			);
		}

		this._updateWeekRangeBoard(from, to);
	}

	public onPlannerAnimationEnd(): void { 
		this.slidePlannerDirection.set(null);
	}

	private _setPlannerAnimationDirection(currentWeekIndex: number): void {
		this.slidePlannerDirection.update(() =>
			currentWeekIndex > this._previousWeekIndex()
				? AnimationPlannerDirection.Right
				: AnimationPlannerDirection.Left,
		);

		this._previousWeekIndex.set(currentWeekIndex);
	}

	private _updateWeekRangeBoard(from: string, to: string): void {
		this.fromDate.update(() => from);
		this.toDate.update(() => to);
	}

	private _loadPlanner(): void {
		if (this.isPlannerLoaded()) {
			return;
		}

		this._store.dispatch(plannerActions.getPlanner({ id: this.plannerId }));
	}

	private _getDutiesForCurrentPlanner(
		fromDate: string,
		toDate: string,
	): Map<string, DutyDto[]> {
		return this.isDynamic
			? this._dutyHelperService.groupDutiesByDays(
					this._store.selectSignal(
						selectDutiesByPlannerIdAndRangeTime(
							this.plannerId,
							fromDate,
							toDate,
						),
					),
			  )
			: this._dutyHelperService.groupDutiesByDays(
					this._store.selectSignal(
						selectDutiesByPlannerId(this.plannerId),
					),
			  );
	}
}
