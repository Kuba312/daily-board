import {
	Component,
	computed,
	DestroyRef,
	effect,
	inject,
	Injector,
	runInInjectionContext,
	Signal,
	signal,
	WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { notEmpty } from '@core/helpers/not-empty-operator.helper';
import { Option, Optional } from '@core/types/basics.types';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { dutyActions } from '@shared-store/duty-store/duty.actions';
import { selectDutyById } from '@shared-store/duty-store/duty.selectors';
import { plannerActions } from '@shared-store/planner-store/planner.actions';
import { selectPlannerById } from '@shared-store/planner-store/planner.selectors';
import FormColorPickerComponent from '@shared/components/form-color-picker/form-color-picker.component';
import FormInputComponent from '@shared/components/form-input/form-input.component';
import FormSelectComponent from '@shared/components/form-select/form-select.component';
import FormTextareaComponent from '@shared/components/form-textarea/form-textarea.component';
import HeaderComponent from '@shared/components/header/header.component';
import PrimaryButtonComponent from '@shared/components/primary-button/primary-button.component';
import {
	DYNAMIC_PLANNER,
	PLANNER_ID,
} from '@shared/constants/shared-consts.const';
import { INVALID_FORM_TRANSLATE_KEY } from '@shared/constants/translation-keys.const';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { validateForm } from '@shared/utils/form.utils';
import { take } from 'rxjs';
import { DutyDto, PlannerDto } from 'src/api/models';
import { TaskBoardFormModel } from './task-board-form.form-model';
import TaskInputDateComponent from './task-input-date/task-input-date.component';
import { PlannerType } from '@shared/enums/planner-type.enum';

@Component({
    selector: 'app-task-board-form',
    imports: [
        TranslateModule,
        ReactiveFormsModule,
        HeaderComponent,
        FormInputComponent,
        FormTextareaComponent,
        FormColorPickerComponent,
        PrimaryButtonComponent,
        FormSelectComponent,
        TaskInputDateComponent,
    ],
    templateUrl: './task-board-form.component.html',
    styleUrl: './task-board-form.component.scss',
})
export default class TaskBoardFormComponent {
	private readonly _store: Store = inject(Store);
	private readonly _routerHelperService: RouterHelperService =
		inject(RouterHelperService);
	private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly _snackbarService: SnackBarService =
		inject(SnackBarService);
	private readonly _translateService: TranslateService =
		inject(TranslateService);
	private readonly _injector: Injector = inject(Injector);
	private readonly _destroyRef: DestroyRef = inject(DestroyRef);

	public readonly BACK_URL: string = '/choose-planner';
	public readonly BOARD_URL: string = '/planners';

	public plannerId: string = this._routerHelperService.getParameterValue(
		this._activatedRoute,
		PLANNER_ID,
	);
	private readonly _dutyId: Option<string> =
		this._activatedRoute.snapshot.paramMap.has?.('dutyId')
			? this._activatedRoute.snapshot.paramMap.get('dutyId')
			: null;
	public currentPlanner: Signal<Optional<PlannerDto>> =
		this._store.selectSignal(selectPlannerById(this.plannerId));
	public currentDuty: Signal<Optional<DutyDto>> = this._dutyId
		? this._store.selectSignal(selectDutyById(this._dutyId))
		: signal(undefined);

	public currentPlannerLabel: Signal<string> = computed(() =>
		this.currentPlanner()
			? `${this._translateService.instant('global.for')} '${
					this.currentPlanner()?.name
			  }'`
			: '',
	);

	public formModel: WritableSignal<Option<TaskBoardFormModel>> = signal(null);
	public isConstantPlanner: WritableSignal<boolean> = signal<boolean>(true);
	private _editFormInitialized: boolean = false;

	ngOnInit(): void {
		this._getCurrentPlanner();
		this._getCurrentDuty();
		this._initializeForm();
	}

	public sendForm(redirectToBoard: boolean = true): boolean {
		const formModel = this.formModel();
		const formGroup = this.formModel()?.formGroup();

		if (!formGroup || !formModel) {
			return false;
		}

		validateForm(formGroup);

		if (
			formGroup.invalid ||
			(!this.isEditMode &&
				this._isDynamicPlannerMissingAddedDates(formModel))
		) {
			this._snackbarService.onShowSnackBarError({
				message: INVALID_FORM_TRANSLATE_KEY,
			});

			return false;
		}

		const plannerType = this.isConstantPlanner()
			? PlannerType.Constant
			: PlannerType.Dynamic;

		if (this.isEditMode) {
			this._updateDuty(formModel, plannerType, redirectToBoard);

			return true;
		}

		const duties = formModel.toModel();

		this._store.dispatch(
			dutyActions.saveDuty({
				duties,
				plannerId: this.plannerId,
				redirectToBoard,
				plannerType,
			}),
		);

		return true;
	}

	public saveAndClearForm(): void {
		const wasSubmitted = this.sendForm(false);

		if (wasSubmitted) {
			this.formModel()?.clearForm();
		}
	}

	private _getCurrentPlanner(): void {
		this._store.dispatch(plannerActions.getPlanner({ id: this.plannerId }));
	}

	private _getCurrentDuty(): void {
		if (!this.isEditMode) {
			return;
		}

		this._store.dispatch(
			dutyActions.getDutiesByPlannerId({ plannerId: this.plannerId }),
		);
	}

	private _initializeForm(): void {
		toObservable(this.currentPlanner, { injector: this._injector })
			.pipe(
				notEmpty(),
				take(1), 
				takeUntilDestroyed(this._destroyRef),
			)
			.subscribe((currentPlanner) => {
				if (!currentPlanner) {
					return;
				}

				runInInjectionContext(this._injector, () => {
					this._setIsConstantPlanner(currentPlanner);
					this._setFormModel(currentPlanner);
					this._initializeEditDutyPatch();
				});
			});
	}

	private _initializeEditDutyPatch(): void {
		if (!this.isEditMode) {
			return;
		}

		effect(() => {
			const duty = this.currentDuty();

			if (!duty || this._editFormInitialized) {
				return;
			}

			this.formModel()?.patchDuty(duty);
			this._editFormInitialized = true;
		});
	}

	private _setIsConstantPlanner(currentPlanner: PlannerDto): void {
		this.isConstantPlanner.set(currentPlanner?.isConstant ?? false);
	}

	private _setFormModel(currentPlanner: PlannerDto): void {
		this.formModel.set(
			new TaskBoardFormModel(this.isConstantPlanner(), currentPlanner),
		);
	}

	private _isDynamicPlannerMissingAddedDates(
		formModel: TaskBoardFormModel,
	): boolean {
		return (
			!this.isConstantPlanner() &&
			(formModel.addedChipTagsDates()?.length ?? 0) === 0
		);
	}

	private _updateDuty(
		formModel: TaskBoardFormModel,
		plannerType: PlannerType,
		redirectToBoard: boolean,
	): void {
		const dutyId = this._dutyId;
		const currentDuty = this.currentDuty();

		if (!dutyId || !currentDuty) {
			return;
		}

		this._store.dispatch(
			dutyActions.updateDuty({
				duty: formModel.toSingleModel(currentDuty),
				dutyId,
				plannerId: this.plannerId,
				plannerType,
				redirectToBoard,
			}),
		);
	}

	get isEditMode(): boolean {
		return !!this._dutyId;
	}

	get backUrl(): string {
		if (!this.isEditMode) {
			return this.BACK_URL;
		}

		return `${this.BOARD_URL}/${this.plannerId}/${
			this.isConstantPlanner()
				? PlannerType.Constant
				: DYNAMIC_PLANNER
		}`;
	}

	get backQueryParams(): Option<Params> {
		if (!this.isEditMode || this.isConstantPlanner()) {
			return null;
		}

		const { from, to } = this._activatedRoute.snapshot.queryParams;

		return from && to ? { from, to } : null;
	}
}
