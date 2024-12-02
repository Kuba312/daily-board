import { Component, computed, inject, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Option } from '@core/types/basics.types';
import { plannerActions } from '@shared-store/planner-store/planner.actions';
import { selectPlannerById } from '@shared-store/planner-store/planner.selectors';
import SafeValue from '@shared/pipes/safe-value.pipe';
import { Store } from '@ngrx/store';
import { selectDutiesByPlannerId } from '@shared-store/duty-store/duty.selectors';
import HeaderComponent from '@shared/components/header/header.component';
import PlannerBoardComponent from '@shared/components/planner-board/planner-board.component';
import { PLANNER_ID } from '@shared/constants/shared-consts.const';
import { DateDisplayMode } from '@shared/enums/date-display-mode.enum';
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

	public readonly duties: Map<string, DutyDto[]> =
		this._dutyHelperService.groupDutiesByDays(
			this._store.selectSignal(selectDutiesByPlannerId(this.plannerId)),
		);
	public readonly plannerDetails: Signal<Option<PlannerDto>> =
		this._store.selectSignal(selectPlannerById(this.plannerId));
	public readonly isPlannerLoaded: Signal<boolean> = computed(() => {
		const planner = this.plannerDetails();

		return !!planner;
	});

	ngOnInit(): void {
		this._loadPlanner();
	}

	private _loadPlanner(): void {
		if (this.isPlannerLoaded()) {
			return;
		}

		this._store.dispatch(plannerActions.getPlanner({ id: this.plannerId }));
	}
}
