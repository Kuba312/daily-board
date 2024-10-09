import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormConfig } from '@core/models/form-config';

@Injectable({ providedIn: 'root' })
export class FormFactory {
	private readonly _formBuilder: FormBuilder = inject(FormBuilder);

	createForm(config: FormConfig): FormGroup {
		const { controls, validators, asyncValidators } = config;
		const formGroup = this._formBuilder.group(controls);

		if(validators) {
			formGroup.setValidators(validators);
		}

		if(asyncValidators) {
			formGroup.setAsyncValidators(asyncValidators);
		}

		return formGroup;
	}
}
