import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { Store } from '@ngrx/store';
import { selectDutiesByPlannerId } from '@shared-store/duty-store/duty.selectors';
import HeaderComponent from '@shared/components/header/header.component';
import PlannerBoardComponent from '@shared/components/planner-board/planner-board.component';
import { DateDisplayMode } from '@shared/enums/date-display-mode.enum';
import { DutyHelperService } from '@shared/services/duty-helper/duty-helper.service';
import { DutyDto } from 'src/api/models';
import { PLANNER_ID } from '@shared/constants/shared-consts.const';

@Component({
	selector: 'app-planner',
	standalone: true,
	imports: [HeaderComponent, PlannerBoardComponent],
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

	private readonly plannerId: string =
		this._routerHelperService.getParameterValue(
			this._activateRoute,
			PLANNER_ID,
		);

	public duties: Map<string, DutyDto[]> =
		this._dutyHelperService.groupDutiesByDays(
			this._store.selectSignal(selectDutiesByPlannerId(this.plannerId)),
		);
}
