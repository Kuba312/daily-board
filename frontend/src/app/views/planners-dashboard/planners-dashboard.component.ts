import { Component, inject, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAllPlanners } from '@shared-store/planner-store/planner.selectors';
import HeaderWithButtonsComponent from '@shared/components/header-with-buttons/header-with-buttons.component';
import PlannerCardComponent from '@shared/components/planner-card/planner-card.component';
import PlannerItemsContainerComponent 
	from '@shared/components/planner-items-container/planner-items-container.component';
import { ButtonConfig } from '@shared/models/button-config';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { PlannerDto } from 'src/api/models';

@Component({
	selector: 'app-planners-dashboard',
	standalone: true,
	imports: [
		HeaderWithButtonsComponent,
		PlannerCardComponent,
		PlannerItemsContainerComponent,
	],
	templateUrl: './planners-dashboard.component.html',
	styleUrl: './planners-dashboard.component.scss',
})
export default class PlannersDashboardComponent {
	private readonly _store: Store = inject(Store);
	private readonly _routerHelperService: RouterHelperService =
		inject(RouterHelperService);

	public planners: Signal<PlannerDto[]> =
		this._store.selectSignal(selectAllPlanners);

	public HEADER_BUTTONS: ButtonConfig[] = [
		{
			buttonLabel: 'side-menu.add-planner',
			emitOnClick: true,
			width: 25,
			callback: () => {
				this.directToPlannerCreator();
			},
		},
	];
	public PLANNER_CARD_BUTTONS: ButtonConfig[] = [
		{
			buttonLabel: 'global.edit',
			emitOnClick: true,
			width: 10,
			// TODO: add editing planner
			disabled: () => true,
			callback: (data) => {
				if (!this._isPlannerObject(data)) {
					return;
				}
			},
		},
		{
			buttonLabel: 'global.delete',
			emitOnClick: true,
			width: 10,
			// TODO: add removing planner
			disabled: () => true,
			callback: (data) => {
				if (!this._isPlannerObject(data)) {
					return;
				}
			},
		},
	];

	public directToPlannerCreator(): void {
		this._routerHelperService.directToUrl('/planner-add');
	}

	public directToPlannerDetailsView(planner: PlannerDto): void {
		if (!planner.id) {
			return;
		}

		this._routerHelperService.directToUrl('/planners', [planner.id]);
	}

	private _isPlannerObject(data: unknown): data is PlannerDto {
		return !!data && typeof data === 'object' && 'isConstant' in data;
	}
}
