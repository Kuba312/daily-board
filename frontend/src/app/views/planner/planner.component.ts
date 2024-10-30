import {
	Component,
	inject,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAllDuties } from '@shared-store/duty-store/duty.selectors';
import HeaderComponent from '@shared/components/header/header.component';
import PlannerBoardComponent from '@shared/components/planner-board/planner-board.component';
import { DateDisplayMode } from '@shared/enums/date-display-mode.enum';
import { DutyHelperService } from '@shared/services/duty-helper/duty-helper.service';
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
	private readonly _dutyHelperService: DutyHelperService =
		inject(DutyHelperService);

	readonly DISPLAY_MODE: DateDisplayMode = DateDisplayMode.Weekly;

	public duties: Map<string, DutyDto[]> =
		this._dutyHelperService.groupDutiesByDays(
			this._store.selectSignal(selectAllDuties),
		);
}
