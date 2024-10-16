import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import HeaderComponent from '@shared/components/header/header.component';
import { TaskBoardFormModel } from './task-board-form.form-model';
import FormInputComponent from '@shared/components/form-input/form-input.component';
import WeekDatePickerInputComponent 
	from '@shared/components/date-time-picker/week-date-picker-input/week-date-picker-input.component';

@Component({
	selector: 'app-task-board-form',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		HeaderComponent,
		FormInputComponent,
		WeekDatePickerInputComponent,
	],
	templateUrl: './task-board-form.component.html',
	styleUrl: './task-board-form.component.scss',
})
export default class TaskBoardFormComponent {
	formModel: TaskBoardFormModel = new TaskBoardFormModel();
}
