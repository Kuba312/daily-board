import { inject, DestroyRef, WritableSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { Option } from '@core/types/basics.types';
import { FormFactory } from '@core/services/form-factory/form-factory.service';
import { TimeValidators } from '@shared/validators/time.validators';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import moment from 'moment';
import { MOMENT_MINUTES_TYPE, TIME_FORMAT } from '@shared/shared-consts.const';

export class CalendarTimeRangerFormModel {
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

	addTime(controlName: string): void {
		const control = this.formGroup().get(controlName);

		if (!control) {
			return;
		}

		const { value } = control;

		if (!this._isValidTimeFormat(value)) {
			this._setCurrentTimeIfControlIsEmpty(control);

			return;
		}

		this.incrementTimeByMinute(value, control);
	}

	minusTime(controlName: string): void {
		const control = this.formGroup().get(controlName);

		if (!control) {
			return;
		}

		const { value } = control;

		if (!this._isValidTimeFormat(value)) {
			this._setCurrentTimeIfControlIsEmpty(control);

			return;
		}

		this._decrementTimeByMinute(value, control);
	}

	private _decrementTimeByMinute(
		value: string,
		control: AbstractControl,
	): void {
		if (!value) {
			this._setCurrentTimeIfControlIsEmpty(control);

			return;
		}

		const momentTime = moment(value, TIME_FORMAT);
		const updatedTime = momentTime.subtract(1, MOMENT_MINUTES_TYPE);

		control.setValue(updatedTime.format(TIME_FORMAT));
	}

	private incrementTimeByMinute(
		value: string,
		control: AbstractControl,
	): void {
		if (!value) {
			this._setCurrentTimeIfControlIsEmpty(control);

			return;
		}

		const momentTime = moment(value, TIME_FORMAT);
		const updatedTime = momentTime.add(1, MOMENT_MINUTES_TYPE);

		control.setValue(updatedTime.format(TIME_FORMAT));
	}

	private _setCurrentTimeIfControlIsEmpty(control: AbstractControl): void {
		const currentTime = moment().format(TIME_FORMAT);

		control.setValue(currentTime);
	}

	private _isValidTimeFormat(value: string): boolean {
		return moment(value, TIME_FORMAT, true).isValid();
	}

	get toTime(): Option<AbstractControl> {
		return this.formGroup().get(this.TO_HOUR);
	}

	get fromTime(): Option<AbstractControl> {
		return this.formGroup().get(this.FROM_HOUR);
	}
}
