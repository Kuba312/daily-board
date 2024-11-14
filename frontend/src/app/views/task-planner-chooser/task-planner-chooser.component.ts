import {
	Component,
	inject,
	signal,
	Signal,
	WritableSignal,
} from '@angular/core';
import { Option } from '@core/types/basics.types';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { selectAllPlanners } from '@shared-store/planner-store/planner.selectors';
import HeaderWithButtonsComponent from '@shared/components/header-with-buttons/header-with-buttons.component';
import PlannerCardComponent from '@shared/components/planner-card/planner-card.component';
import PlannerItemsContainerComponent 
	from '@shared/components/planner-items-container/planner-items-container.component';
import { ButtonConfig } from '@shared/models/button-config';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { PlannerDto } from 'src/api/models';

@Component({
	selector: 'app-task-planner-chooser',
	standalone: true,
	imports: [
		TranslateModule,
		HeaderWithButtonsComponent,
		PlannerCardComponent,
		PlannerItemsContainerComponent,
	],
	templateUrl: './task-planner-chooser.component.html',
	styleUrl: './task-planner-chooser.component.scss',
})
export default class TaskPlannerChooserComponent {
	private readonly _store: Store = inject(Store);
	private readonly _routerHelperService: RouterHelperService =
		inject(RouterHelperService);

	public planners: Signal<PlannerDto[]> =
		this._store.selectSignal(selectAllPlanners);

	public selectedPlannerCard: WritableSignal<Option<PlannerDto>> =
		signal<Option<PlannerDto>>(null);
	public disabledButton: WritableSignal<boolean> = signal<boolean>(true);
	public HEADER_BUTTONS: ButtonConfig[] = [
		{
			buttonLabel: 'task-planner-chooser.assign-task',
			emitOnClick: true,
			width: 25,
			disabled: () => this.disabledButton(),
			callback: () => this.moveToCreateTaskPage(),
		},
	];

	public selectPlannerCard(planner: PlannerDto): void {
		this.selectedPlannerCard.set(planner);
		this.disabledButton.set(false);
	}

	public moveToCreateTaskPage(): void {
		const selectedPlannerCardId = this.selectedPlannerCard()?.id;

		if (!selectedPlannerCardId) {
			return;
		}

		this._directToDutyCreationPage(selectedPlannerCardId);
	}

	private _directToDutyCreationPage(selectedPlannerCardId: string): void {
		this._routerHelperService.directToUrl('/task-board-add', [
			selectedPlannerCardId,
		]);
	}
}
