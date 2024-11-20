import { Component, input, InputSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Option } from '@core/types/basics.types';
import { TranslateModule } from '@ngx-translate/core';
import { TranslatePath } from '@shared/pipes/translate-path.pipe';
import FormErrorMessageComponent from '../form-error-message/form-error-message.component';

@Component({
	selector: 'app-form-select',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		MatInputModule,
		MatFormFieldModule,
		MatSelectModule,
		TranslateModule,
		FormErrorMessageComponent,
		TranslatePath,
	],
	templateUrl: './form-select.component.html',
})
export default class FormSelectComponent<T> {
	formGroup: InputSignal<FormGroup> = input.required<FormGroup>();
	controlName: InputSignal<string> = input.required<string>();
	options: InputSignal<T[]> = input.required<T[]>();
	valueToSend: InputSignal<Option<keyof T>> = input<Option<keyof T>>();
	valueToShow: InputSignal<Option<keyof T>> = input<Option<keyof T>>(null);
	translateKey: InputSignal<Option<string>> = input<Option<string>>(null);
	label: InputSignal<Option<string>> = input<Option<string>>();
	placeholder: InputSignal<Option<string>> = input<Option<string>>();
	width: InputSignal<number> = input<number>(100);
	matIcon: InputSignal<Option<string>> = input<Option<string>>(null);
	customErrorMessages: InputSignal<Option<Record<string, string>>> =
		input<Option<Record<string, string>>>(null);
}
