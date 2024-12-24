import {
	Component,
	computed,
	DestroyRef,
	inject,
	Injector,
	runInInjectionContext,
	Signal,
	signal,
	WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { notEmpty } from '@core/helpers/not-empty-operator.helper';
import { Option, Optional } from '@core/types/basics.types';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { dutyActions } from '@shared-store/duty-store/duty.actions';
import { plannerActions } from '@shared-store/planner-store/planner.actions';
import { selectPlannerById } from '@shared-store/planner-store/planner.selectors';
import FormColorPickerComponent from '@shared/components/form-color-picker/form-color-picker.component';
import FormInputComponent from '@shared/components/form-input/form-input.component';
import FormSelectComponent from '@shared/components/form-select/form-select.component';
import FormTextareaComponent from '@shared/components/form-textarea/form-textarea.component';
import HeaderComponent from '@shared/components/header/header.component';
import PrimaryButtonComponent from '@shared/components/primary-button/primary-button.component';
import { PLANNER_ID } from '@shared/constants/shared-consts.const';
import { INVALID_FORM_TRANSLATE_KEY } from '@shared/constants/translation-keys.const';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { validateForm } from '@shared/utils/form.utils';
import { take } from 'rxjs';
import { PlannerDto } from 'src/api/models';
import { TaskBoardFormModel } from './task-board-form.form-model';
import TaskInputDateComponent from './task-input-date/task-input-date.component';
import { PlannerType } from '@shared/enums/planner-type.enum';

@Component({
	selector: 'app-task-board-form',
	standalone: true,
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

	public plannerId: string = this._routerHelperService.getParameterValue(
		this._activatedRoute,
		PLANNER_ID,
	);
	public currentPlanner: Signal<Optional<PlannerDto>> =
		this._store.selectSignal(selectPlannerById(this.plannerId));

	public currentPlannerLabel: Signal<string> = computed(() =>
		this.currentPlanner()
			? `${this._translateService.instant('global.for')} '${
					this.currentPlanner()?.name
			  }'`
			: '',
	);

	public formModel: WritableSignal<Option<TaskBoardFormModel>> = signal(null);
	public isConstantPlanner: WritableSignal<boolean> = signal<boolean>(true);

	ngOnInit(): void {
		this._getCurrentPlanner();
		this._initializeForm();
	}

	public sendForm(redirectToBoard: boolean = true): void {
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

		const duties = formModel.toModel();
		const plannerType = this.isConstantPlanner()
			? PlannerType.Constant
			: PlannerType.Dynamic;

		this._store.dispatch(
			dutyActions.saveDuty({
				duties,
				plannerId: this.plannerId,
				redirectToBoard,
				plannerType,
			}),
		);
	}

	public saveAndClearForm(): void {
		this.sendForm(false);

		this.formModel()?.clearForm();
	}

	private _getCurrentPlanner(): void {
		this._store.dispatch(plannerActions.getPlanner({ id: this.plannerId }));
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
				});
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
}
