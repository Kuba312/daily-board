import {
	Component,
	inject,
	Injector,
	OnInit,
	effect,
	runInInjectionContext,
	Signal,
	signal,
	WritableSignal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Option } from '@core/types/basics.types';
import { TranslateModule } from '@ngx-translate/core';
import WeekDatePickerInputComponent 
	from '@shared/components/date-time-picker/week-date-picker-input/week-date-picker-input.component';
import FormInputComponent from '@shared/components/form-input/form-input.component';
import FormSelectComponent from '@shared/components/form-select/form-select.component';
import FormTextareaComponent from '@shared/components/form-textarea/form-textarea.component';
import HeaderComponent from '@shared/components/header/header.component';
import PrimaryButtonComponent from '@shared/components/primary-button/primary-button.component';
import { INVALID_FORM_TRANSLATE_KEY } from '@shared/constants/translation-keys.const';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { validateForm } from '@shared/utils/form.utils';
import { PlannerFormModel } from './planner-form.form-model';
import { Store } from '@ngrx/store';
import { plannerActions } from '@shared-store/planner-store/planner.actions';
import { ActivatedRoute } from '@angular/router';
import { selectPlannerById } from '@shared-store/planner-store/planner.selectors';
import { PlannerDto, PlannerUpdateDto } from 'src/api/models';
import { DialogService } from '@shared/services/dialog/dialog.service';
import InformationDialogComponent from '@shared/components/infromation-dialog/infromation-dialog.component';
import { take } from 'rxjs';

@Component({
    selector: 'app-planner-form',
    imports: [
        TranslateModule,
        ReactiveFormsModule,
        HeaderComponent,
        FormInputComponent,
        FormTextareaComponent,
        FormSelectComponent,
        PrimaryButtonComponent,
        WeekDatePickerInputComponent,
    ],
    templateUrl: './planner-form.component.html',
    styleUrl: './planner-form.component.scss',
})
export default class PlannerFormComponent implements OnInit {
	private readonly _injector: Injector = inject(Injector);
	private readonly _store: Store = inject(Store);
	private readonly _snackbarService: SnackBarService =
		inject(SnackBarService);
	private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly _dialogService: DialogService = inject(DialogService);

	public formModel: WritableSignal<Option<PlannerFormModel>> = signal(null);
	public clearDateInput: WritableSignal<boolean> = signal(false);
	public readonly BACK_URL: string = '/planners';
	private readonly _plannerId: Option<string> =
		this._activatedRoute.snapshot.paramMap.get('plannerId');
	private readonly _planner: Signal<PlannerDto | undefined> = this._plannerId
		? this._store.selectSignal(selectPlannerById(this._plannerId))
		: signal(undefined);
	private _editFormInitialized: boolean = false;
	private _editFormInitializedWithPlannerShape: boolean = false;

	ngOnInit(): void {
		this._initializeForm();

		if (this.isEditMode && this._plannerId) {
			this._store.dispatch(plannerActions.getPlanner({ id: this._plannerId }));
		}
	}

	public sendForm(redirectToPlanners: boolean = true): void {
		const formModel = this.formModel();
		const formGroup = this.formModel()?.formGroup();

		if (!formGroup || !formModel) {
			return;
		}

		validateForm(formGroup);

		if (formGroup.invalid) {
			this._snackbarService.onShowSnackBarError({
				message: INVALID_FORM_TRANSLATE_KEY,
			});

			return;
		}

		const planner = formModel.toModel();

		if (!this.isEditMode) {
			this._store.dispatch(
				plannerActions.savePlanner({ planner, redirectToPlanners }),
			);
			return;
		}

		this._updatePlanner(planner);
	}

	public saveAndClearForm(): void {
		this.sendForm(false);

		this.formModel()?.clearForm();
	}

	private _initializeForm(): void {
		runInInjectionContext(this._injector, () => {
			this.formModel.set(new PlannerFormModel());

			effect(() => {
				const planner = this._planner();
				const formGroup = this.formModel()?.formGroup();

				if (!this.isEditMode || !planner || !formGroup) {
					return;
				}

				const plannerHasShape = this._hasPlannerShape(planner);
				const shouldPatchPlanner =
					!this._editFormInitialized ||
					(
						!this._editFormInitializedWithPlannerShape &&
						plannerHasShape &&
						formGroup.pristine
					);

				if (!shouldPatchPlanner) {
					return;
				}

				this.formModel()?.patchPlanner(planner);
				this._editFormInitialized = true;
				this._editFormInitializedWithPlannerShape = plannerHasShape;
			});
		});
	}

	private _updatePlanner(planner: PlannerDto): void {
		const plannerId = this._plannerId;
		const originalPlanner = this._planner();

		if (!plannerId || !originalPlanner) {
			return;
		}

		const updatePlanner: PlannerUpdateDto = {
			name: planner.name,
			note: planner.note,
			startTime: planner.startTime,
			endTime: planner.endTime,
			isConstant: planner.isConstant,
		};

		if (!this._hasPlannerShapeChanged(originalPlanner, updatePlanner)) {
			this._dispatchPlannerUpdate(plannerId, updatePlanner, false);
			return;
		}

		this._dialogService
			.openConfirmationDialog(InformationDialogComponent, {
				message: 'planner-form.confirm-shape-change',
				cancelButtonLabel: 'global.cancel',
				confirmButtonLabel: 'global.confirm',
			})
			.pipe(take(1))
			.subscribe((confirmed) => {
				if (!confirmed) {
					return;
				}

				this._dispatchPlannerUpdate(
					plannerId,
					{
						...updatePlanner,
						confirmDutyDeletionOnShapeChange: true,
					},
					true,
				);
			});
	}

	private _dispatchPlannerUpdate(
		id: string,
		planner: PlannerUpdateDto,
		shapeChangeConfirmed: boolean,
	): void {
		this._store.dispatch(
			plannerActions.updatePlanner({
				id,
				planner,
				shapeChangeConfirmed,
			}),
		);
	}

	private _hasPlannerShapeChanged(
		originalPlanner: PlannerDto,
		planner: PlannerUpdateDto,
	): boolean {
		return (
			originalPlanner.startTime !== planner.startTime ||
			originalPlanner.endTime !== planner.endTime ||
			originalPlanner.isConstant !== planner.isConstant
		);
	}

	private _hasPlannerShape(planner: PlannerDto): boolean {
		return !!planner.startTime && !!planner.endTime;
	}

	get isEditMode(): boolean {
		return !!this._plannerId;
	}
}
