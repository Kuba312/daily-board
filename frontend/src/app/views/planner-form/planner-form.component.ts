import {
	Component,
	inject,
	Injector,
	OnInit,
	runInInjectionContext,
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
    styleUrl: './planner-form.component.scss'
})
export default class PlannerFormComponent implements OnInit {
	private readonly _injector: Injector = inject(Injector);
	private readonly _store: Store = inject(Store);
	private readonly _snackbarService: SnackBarService =
		inject(SnackBarService);

	public formModel: WritableSignal<Option<PlannerFormModel>> = signal(null);
	public clearDateInput: WritableSignal<boolean> = signal(false);

	ngOnInit(): void {
		this._initializeForm();
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
		
		this._store.dispatch(
			plannerActions.savePlanner({ planner, redirectToPlanners }),
		);
	}

	public saveAndClearForm(): void {
		this.sendForm(false);

		this.formModel()?.clearForm();
	}

	private _initializeForm(): void {
		runInInjectionContext(this._injector, () => {
			this.formModel.set(new PlannerFormModel());
		});
	}
}
