import { Component, input, InputSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Option } from '@core/types/basics.types';
import { InputType } from '@core/types/dates.types';
import { FormErrorMessageComponent } from '../form-error-message/form-error-message.component';
import SafeValue from '@shared/pipes/safe-value.pipe';

@Component({
	standalone: true,
	imports: [
		ReactiveFormsModule,
		SafeValue,
		MatIconModule,
		MatInputModule,
		MatFormFieldModule,
		FormErrorMessageComponent,
	],
	selector: 'app-form-input',
	templateUrl: 'form-input.component.html',
})
export default class FormInputComponent {
	formGroup: InputSignal<FormGroup> = input.required<FormGroup>();
	controlName: InputSignal<string> = input.required<string>();
	label: InputSignal<Option<string>> = input<Option<string>>();
	placeholder: InputSignal<Option<string>> = input<Option<string>>();
	width: InputSignal<number> = input<number>(100);
	inputType: InputSignal<InputType> = input<InputType>('text');
	matIcon: InputSignal<Option<string>> = input<Option<string>>(null);
	customErrorMessages: InputSignal<Option<Record<string, string>>> =
		input<Option<Record<string, string>>>(null);
}
