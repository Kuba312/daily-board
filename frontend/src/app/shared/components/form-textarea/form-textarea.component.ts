import { TextFieldModule } from '@angular/cdk/text-field';
import { Component, input, InputSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormField } from '@angular/material/form-field';
import { Option } from '@core/types/basics.types';
import { FormErrorMessageComponent } from '../form-error-message/form-error-message.component';
import { MatInputModule } from '@angular/material/input';
import SafeValue from '@shared/pipes/safe-value.pipe';

@Component({
	selector: 'app-form-textarea',
	standalone: true,
	imports: [
		MatFormField,
		TextFieldModule,
		MatInputModule,
		ReactiveFormsModule,
		SafeValue,
		FormErrorMessageComponent,
	],
	templateUrl: './form-textarea.component.html',
})
export default class FormTextareaComponent {
	formGroup: InputSignal<FormGroup> = input.required<FormGroup>();
	controlName: InputSignal<string> = input.required<string>();
	label: InputSignal<Option<string>> = input<Option<string>>();
	placeholder: InputSignal<Option<string>> = input<Option<string>>();
	rows: InputSignal<number> = input<number>(5);
	cols: InputSignal<number> = input<number>(10)
	width: InputSignal<number> = input<number>(100);
	customErrorMessages: InputSignal<Option<Record<string, string>>> =
		input<Option<Record<string, string>>>(null);
}
