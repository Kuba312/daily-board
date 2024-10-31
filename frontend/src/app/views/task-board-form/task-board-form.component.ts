import { NgClass } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import WeekDatePickerInputComponent 
	from '@shared/components/date-time-picker/week-date-picker-input/week-date-picker-input.component';
import FormColorPickerComponent from '@shared/components/form-color-picker/form-color-picker.component';
import FormInputComponent from '@shared/components/form-input/form-input.component';
import FormSelectComponent from '@shared/components/form-select/form-select.component';
import FormTextareaComponent from '@shared/components/form-textarea/form-textarea.component';
import HeaderComponent from '@shared/components/header/header.component';
import PrimaryButtonComponent from '@shared/components/primary-button/primary-button.component';
import { INVALID_FORM_TRANSLATE_KEY } from '@shared/constants/translation-keys.const';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { validateForm } from '@shared/utils/form.utils';
import { TaskBoardFormModel } from './task-board-form.form-model';

@Component({
	selector: 'app-task-board-form',
	standalone: true,
	imports: [
		NgClass,
		TranslateModule,
		ReactiveFormsModule,
		HeaderComponent,
		FormInputComponent,
		WeekDatePickerInputComponent,
		FormTextareaComponent,
		FormColorPickerComponent,
		PrimaryButtonComponent,
		FormSelectComponent,
	],
	templateUrl: './task-board-form.component.html',
	styleUrl: './task-board-form.component.scss',
})
export default class TaskBoardFormComponent {
	private readonly _store: Store = inject(Store);
	private readonly _snackbarService: SnackBarService =
		inject(SnackBarService);

	formModel: TaskBoardFormModel = new TaskBoardFormModel();

	isOnlyHourConfig: WritableSignal<boolean> = signal<boolean>(true);

	sendForm(): void {
		const formGroup = this.formModel.formGroup();

		validateForm(formGroup);

		if (formGroup.invalid) {
			this._snackbarService.onShowSnackBarError({
				message: INVALID_FORM_TRANSLATE_KEY,
			});

			return;
		}

		// const duty = this.formModel.toModel();

		// TODO: Adjust for planner creation!
		// this._store.dispatch(dutyActions.saveDuty({ duty,  }));
	}
}
