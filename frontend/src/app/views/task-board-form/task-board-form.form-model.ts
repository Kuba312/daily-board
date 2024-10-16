import { inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormFactory } from '@core/services/form-factory/form-factory.service';
import { TimeValidators } from '@shared/validators/time.validators';

export class TaskBoardFormModel {
	private readonly _formFactory: FormFactory = inject(FormFactory);

	public readonly NAME: string = 'name';
	public readonly DATE: string = 'date';

	formGroup: FormGroup = new FormGroup({});

	constructor() {
		this._buildForm();
	}

	private _buildForm(): void {
		this.formGroup = this._formFactory.createForm({
			controls: {
				[this.NAME]: new FormControl('', [Validators.required]),
				[this.DATE]: new FormControl('', [
					Validators.required,
					TimeValidators.validateDate(),
					TimeValidators.validateTime(),
				]),
			},
		});
	}
}
