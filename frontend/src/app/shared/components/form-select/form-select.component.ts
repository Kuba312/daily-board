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
    imports: [
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        TranslateModule,
        FormErrorMessageComponent,
        TranslatePath,
    ],
    templateUrl: './form-select.component.html'
})
export default class FormSelectComponent<T> {
	public formGroup: InputSignal<FormGroup> = input.required<FormGroup>();
	public controlName: InputSignal<string> = input.required<string>();
	public options: InputSignal<T[]> = input.required<T[]>();
	public valueToSend: InputSignal<Option<keyof T>> = input<Option<keyof T>>();
	public valueToShow: InputSignal<Option<keyof T>> = input<Option<keyof T>>(null);
	public translateKey: InputSignal<Option<string>> = input<Option<string>>(null);
	public label: InputSignal<Option<string>> = input<Option<string>>();
	public placeholder: InputSignal<Option<string>> = input<Option<string>>();
	public width: InputSignal<number> = input<number>(100);
	public matIcon: InputSignal<Option<string>> = input<Option<string>>(null);
	public customErrorMessages: InputSignal<Option<Record<string, string>>> =
		input<Option<Record<string, string>>>(null);
	public isMultiple: InputSignal<Option<boolean>> = input<Option<boolean>>(null);
	public transformToSmallerCase: InputSignal<Option<boolean>> = input<Option<boolean>>(null);
}
