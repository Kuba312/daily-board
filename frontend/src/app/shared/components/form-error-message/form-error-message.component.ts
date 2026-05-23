import { Component, input, InputSignal } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatError } from '@angular/material/form-field';
import {
	FORM_ERROR_MESSAGES,
	ValidatorNames,
	ValidatorsImportanceOrderList,
} from '@core/form-errors.consts';
import { Option } from '@core/types/basics.types';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-form-error-message',
    imports: [MatError, TranslateModule],
    template: `
	<mat-error>
		{{ errorMessage | translate }}
	</mat-error>`,
})
export default class FormErrorMessageComponent {
	formGroup: InputSignal<Option<FormGroup>> = input<Option<FormGroup>>(null);
	controlName: InputSignal<Option<string>> = input<Option<string>>(null);
	customMessage: InputSignal<Option<Record<string, string>>> =
		input<Option<Record<string, string>>>(null);

	get errorMessage(): string {
		const formControl = this._getCurrentControl();		
		const errorName = this._findControlErrorMessage(formControl);

		if (!errorName || !formControl?.touched) {
			return '';
		}
		
		const customMessages = this._findCustomErrorMessage(errorName);
		
		if (customMessages) {
			return customMessages;
		}

		if (!this._isFormErrorDefinedInDefaultErrorList(errorName)) {
			return '';
		}
		
		return FORM_ERROR_MESSAGES?.[errorName] || errorName;
	}

	private _getCurrentControl(): Option<AbstractControl> {
		return this.formGroup()?.get(this.controlName() ?? '');
	}

	private _findControlErrorMessage(
		control: Option<AbstractControl>,
	): Option<ValidatorNames> {
		if (!control || !control.hasError) {
			return null;
		}

		return ValidatorsImportanceOrderList.find((error) =>
			control.hasError(error),
		);
	}

	private _findCustomErrorMessage(errorName: string): string {
		return this.customMessage()?.[errorName] ?? '';
	}

	private _isFormErrorDefinedInDefaultErrorList(
		errorName: ValidatorNames,
	): boolean {
		return Object.values(ValidatorNames).some((err) => err === errorName);
	}
}
