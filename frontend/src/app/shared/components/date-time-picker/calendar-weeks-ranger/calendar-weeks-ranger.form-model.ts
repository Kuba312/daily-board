import { DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { FormFactory } from '@app/core/services/form-factory/form-factory.service';
import { Option } from '@app/core/types/basics.types';
import { TimeValidators } from '@app/shared/validators/time.validators';
import { debounceTime, distinctUntilChanged } from 'rxjs';

export class CalendarWeeksRangerFormModel {
	private readonly _formFactory: FormFactory = inject(FormFactory);
	private readonly _dRef: DestroyRef = inject(DestroyRef);

	public readonly FROM_HOUR: string = 'fromHour';
	public readonly TO_HOUR: string = 'toHour';

	formGroup: WritableSignal<FormGroup> = signal(new FormGroup({}));

	constructor() {
		this._buildForm();
	}

	private _buildForm(): void {
		this.formGroup.set(
			this._formFactory.createForm({
				controls: {
					[this.FROM_HOUR]: new FormControl(null, [
						TimeValidators.validateSingleTime(),
						TimeValidators.isSingleFromTimeBeforeEndTime(
							this.TO_HOUR,
						),
					]),
					[this.TO_HOUR]: new FormControl(
						null,
						TimeValidators.validateSingleTime(),
					),
				},
			}),
		);

		this._setToTimeListener();
	}

	private _setToTimeListener(): void {
		const toTimeControl = this.toTime;

		if (!toTimeControl) {
			return;
		}

		toTimeControl.valueChanges
		.pipe(
			debounceTime(500),
			distinctUntilChanged(),
			takeUntilDestroyed(this._dRef),
		)
		.subscribe(() => {
			this.fromTime?.updateValueAndValidity();
		});
	}

	get toTime(): Option<AbstractControl> {
		return this.formGroup().get(this.TO_HOUR);
	}

	get fromTime(): Option<AbstractControl> {
		return this.formGroup().get(this.FROM_HOUR);
	}
}
