import { inject, DestroyRef, WritableSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { Option } from '@core/types/basics.types';
import { FormFactory } from '@core/services/form-factory/form-factory.service';
import { TimeValidators } from '@shared/validators/time.validators';
import { distinctUntilChanged } from 'rxjs';
import moment from 'moment';
import { MOMENT_MINUTES_TYPE, TIME_FORMAT } from '@shared/constants/shared-consts.const';
import { TimeValueConnectorService } from '@shared/services/time-value-connector.service';

export class CalendarTimeRangerFormModel {
	private readonly _formFactory: FormFactory = inject(FormFactory);
	private readonly _dRef: DestroyRef = inject(DestroyRef);
	private readonly _timeValueConnector: TimeValueConnectorService = inject(
		TimeValueConnectorService,
	);

	public readonly FROM_HOUR: string = 'fromHour';
	public readonly TO_HOUR: string = 'toHour';

	formGroup: WritableSignal<FormGroup> = signal(new FormGroup({}));

	constructor(fromTime: Option<string>, toTime: Option<string>) {
		this._buildForm(fromTime, toTime);
	}

	private _buildForm(fromTime: Option<string>, toTime: Option<string>): void {
		this._timeValueConnector.changeTimeFromValue(fromTime);
		this._timeValueConnector.changeTimeToValue(toTime);

		this.formGroup.set(
			this._formFactory.createForm({
				controls: {
					[this.FROM_HOUR]: new FormControl(fromTime ?? null, [
						TimeValidators.validateSingleTime(),
						TimeValidators.isSingleFromTimeBeforeEndTime(
							this.TO_HOUR,
						),
					]),
					[this.TO_HOUR]: new FormControl(
						toTime ?? null,
						TimeValidators.validateSingleTime(),
					),
				},
			}),
		);

		this._setToTimeListener();
		this._setFromTimeListener();
	}

	private _setToTimeListener(): void {
		const toTimeControl = this.toTime;

		if (!toTimeControl) {
			return;
		}

		toTimeControl.valueChanges
			.pipe(
				distinctUntilChanged(),
				takeUntilDestroyed(this._dRef),
			)
			.subscribe((value) => {
				const splittedValue = this._normalizeTime(value);

				this.fromTime?.updateValueAndValidity();
				this._timeValueConnector.changeTimeToValue(splittedValue);
			});
	}

	private _setFromTimeListener(): void {
		const fromTimeControl = this.fromTime;

		if (!fromTimeControl) {
			return;
		}

		fromTimeControl.valueChanges
			.pipe(
				distinctUntilChanged(),
				takeUntilDestroyed(this._dRef),
			)
			.subscribe((value) => {
				const splittedValue = this._normalizeTime(value);

				this._timeValueConnector.changeTimeFromValue(splittedValue);
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

		this.incrementTimeByMinute(value, controlName);
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

		this._decrementTimeByMinute(value, controlName);
	}

	private _decrementTimeByMinute(value: string, controlName: string): void {
		const control = this.formGroup().get(controlName);

		if (!control) {
			return;
		}

		if (!value) {
			this._setCurrentTimeIfControlIsEmpty(control);

			return;
		}

		const momentTime = moment(value, TIME_FORMAT);
		const updatedTime = momentTime.subtract(1, MOMENT_MINUTES_TYPE);
		const formattedTime = updatedTime.format(TIME_FORMAT);

		control.setValue(formattedTime);

		this.changeTimeValue(controlName, formattedTime);
	}

	private incrementTimeByMinute(value: string, controlName: string): void {
		const control = this.formGroup().get(controlName);

		if (!control) {
			return;
		}

		if (!value) {
			this._setCurrentTimeIfControlIsEmpty(control);

			return;
		}

		const momentTime = moment(value, TIME_FORMAT);
		const updatedTime = momentTime.add(1, MOMENT_MINUTES_TYPE);
		const formattedTime = updatedTime.format(TIME_FORMAT);

		control.setValue(formattedTime);

		this.changeTimeValue(controlName, formattedTime);
	}

	private _setCurrentTimeIfControlIsEmpty(control: AbstractControl): void {
		const currentTime = moment().format(TIME_FORMAT);

		control.setValue(currentTime);
	}

	private _isValidTimeFormat(value: string): boolean {
		return moment(value, TIME_FORMAT, true).isValid();
	}

	private changeTimeValue(controlName: string, time: string): void {
		if (controlName === this.FROM_HOUR) {
			this._timeValueConnector.changeTimeFromValue(time);

			return;
		}

		this._timeValueConnector.changeTimeToValue(time);
	}

	private _splitTime(value: string): string {
		return value.slice(0, 2) + ':' + value.slice(2);
	}

	private _normalizeTime(value: Option<string>): Option<string> {
		if (!value || value.includes(':')) {
			return value;
		}

		return this._splitTime(value);
	}

	get toTime(): Option<AbstractControl> {
		return this.formGroup().get(this.TO_HOUR);
	}

	get fromTime(): Option<AbstractControl> {
		return this.formGroup().get(this.FROM_HOUR);
	}
}
