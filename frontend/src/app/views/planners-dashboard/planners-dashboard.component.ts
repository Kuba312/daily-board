import { Component, DestroyRef, inject, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
	CONSTANT_PLANNER,
	DYNAMIC_PLANNER,
} from '@shared/constants/shared-consts.const';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { selectAllPlanners } from '@shared-store/planner-store/planner.selectors';
import HeaderWithButtonsComponent from '@shared/components/header-with-buttons/header-with-buttons.component';
import InformationDialogComponent from '@shared/components/infromation-dialog/infromation-dialog.component';
import PlannerCardComponent from '@shared/components/planner-card/planner-card.component';
import PlannerItemsContainerComponent 
	from '@shared/components/planner-items-container/planner-items-container.component';
import PrimaryButtonComponent from '@shared/components/primary-button/primary-button.component';
import { ButtonConfig } from '@shared/models/button-config';
import { DialogService } from '@shared/services/dialog/dialog.service';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { PlannerDto } from 'src/api/models';
import { plannerActions } from '@shared-store/planner-store/planner.actions';

@Component({
    selector: 'app-planners-dashboard',
    imports: [
        HeaderWithButtonsComponent,
        PlannerCardComponent,
        PlannerItemsContainerComponent,
        PrimaryButtonComponent,
        TranslateModule,
    ],
    templateUrl: './planners-dashboard.component.html',
    styleUrl: './planners-dashboard.component.scss'
})
export default class PlannersDashboardComponent {
	private readonly _store: Store = inject(Store);
	private readonly _routerHelperService: RouterHelperService =
		inject(RouterHelperService);
	private readonly _dialogService: DialogService = inject(DialogService);
	private readonly _destroyRef: DestroyRef = inject(DestroyRef);

	private readonly COMPONENT_ID: string = 'task-planners-dashboard';

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
			callback: (data) => {
				if (!this._isPlannerObject(data)) {
					return;
				}

				this.directToPlannerEditor(data);
			},
		},
		{
			buttonLabel: 'global.delete',
			emitOnClick: true,
			width: 10,
			callback: (data) => {
				if (!this._isPlannerObject(data)) {
					return;
				}

				this.deletePlanner(data);
			},
		},
	];

	ngOnInit(): void {
		this._showInformationDialogWhenThereIsNoPlannerCard();
	}

	public directToPlannerCreator(): void {
		this._routerHelperService.directToUrl('/planner-add');
	}

	public directToPlannerEditor(planner: PlannerDto): void {
		if (!planner.id) {
			return;
		}

		this._routerHelperService.directToUrl('/planner-edit', [planner.id]);
	}

	public deletePlanner(planner: PlannerDto): void {
		if (!planner.id) {
			return;
		}

		this._dialogService
			.openConfirmationDialog(InformationDialogComponent, {
				message: 'planners-dashboard.confirm-delete',
				cancelButtonLabel: 'global.cancel',
				confirmButtonLabel: 'global.delete',
			})
			.pipe(takeUntilDestroyed(this._destroyRef))
			.subscribe((confirmed) => {
				if (!confirmed || !planner.id) {
					return;
				}

				this._store.dispatch(
					plannerActions.deletePlanner({ id: planner.id }),
				);
			});
	}

	public directToPlannerDetailsView(planner: PlannerDto): void {
		if (!planner.id) {
			return;
		}

		const isDynamicPlanner = this._getPlannerType(planner);

		this._routerHelperService.directToUrl('/planners', [
			planner.id,
			isDynamicPlanner,
		]);
	}

	private _showInformationDialogWhenThereIsNoPlannerCard(): void {
		if (!this.areNoPlanners) {
			return;
		}

		this._dialogService.openSimpleDialog(
			this._destroyRef,
			InformationDialogComponent,
			this.COMPONENT_ID,
		);
	}

	private _getPlannerType(planner: PlannerDto): string {
		return planner.isConstant ? CONSTANT_PLANNER : DYNAMIC_PLANNER;
	}

	private _isPlannerObject(data: unknown): data is PlannerDto {
		return !!data && typeof data === 'object' && 'isConstant' in data;
	}

	get areNoPlanners(): boolean {
		return this.planners().length === 0;
	}
}
