import { Component, signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskBoardFormModel } from './task-board-form.form-model';
import { NgClass } from '@angular/common';
import { Option } from '@core/types/basics.types';
import { validateForm } from '@shared/utils/form.utils';
import { TranslateModule } from '@ngx-translate/core';
import FormInputComponent from '@shared/components/form-input/form-input.component';
import WeekDatePickerInputComponent 
	from '@shared/components/date-time-picker/week-date-picker-input/week-date-picker-input.component';
import FormTextareaComponent from '@shared/components/form-textarea/form-textarea.component';
import FormColorPickerComponent from '@shared/components/form-color-picker/form-color-picker.component';
import PrimaryButtonComponent from '@shared/components/primary-button/primary-button.component';
import HeaderComponent from '@shared/components/header/header.component';

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
	],
	templateUrl: './task-board-form.component.html',
	styleUrl: './task-board-form.component.scss',
})
export default class TaskBoardFormComponent {
	formModel: TaskBoardFormModel = new TaskBoardFormModel();

	isOnlyHourConfig: WritableSignal<boolean> = signal<boolean>(true);
	tileColor: WritableSignal<Option<string>> = signal<Option<string>>(null);

	sendForm(): void {
		const formGroup = this.formModel.formGroup();

		validateForm(formGroup);

		// TODO: implement snackbar service		
		if(formGroup.invalid) {

			return;
		}

		// const model = this.formModel.toModel();		
	}
}
