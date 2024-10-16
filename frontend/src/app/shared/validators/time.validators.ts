import { AbstractControl, ValidatorFn } from '@angular/forms';
import moment from 'moment';
import { DATE_REGEX, TIME_FORMAT } from '../shared-consts.const';

export class TimeValidators {
	private static TIME_SEPARATOR: string = ':';

	static validateDate(): ValidatorFn {
		return (control: AbstractControl) => {
			if (!control.value) {
				return null;
			}

			const [date] = TimeValidators._splitControlDateValue(control);

			if (!date) {
				return { emptyDate: true };
			}

			return !DATE_REGEX.test(date) ? { invalidDate: true } : null;
		};
	}

	static validateTime(): ValidatorFn {
		return (control: AbstractControl) => {
			if (!control.value) {
				return null;
			}

			const [, time] = TimeValidators._splitControlDateValue(control);
			const { fromTime, toTime } =
				TimeValidators._splitProvidedTime(time);

			if (TimeValidators._isTimeEmpty(fromTime, toTime)) {
				return { emptyTime: true };
			}

			return moment(fromTime, TIME_FORMAT).isBefore(
				moment(toTime, TIME_FORMAT),
			) 
				? null
				: { fromTime: true };
		};
	}

	static validateSingleTime(): ValidatorFn {
		return (control: AbstractControl) => {
			const { value } = control;

			if (!value) {
				return null;
			}

			const [hour, minutes] = TimeValidators._splitSingleTimeValue(value);
			const hourNumber = Number(hour);
			const minutesNumber = Number(minutes);

			return TimeValidators._isInvalidSingleTime(
				hourNumber,
				minutesNumber,
			)
				? { invalidTime: true }
				: null;
		};
	}

	static isSingleFromTimeBeforeEndTime(toTime: string): ValidatorFn {
		return (control: AbstractControl) => {
			const { value } = control;
			const toTimeVal = control?.parent?.get(toTime)?.value;

			if (!toTimeVal || !value) {
				return null;
			}

			return moment(value, TIME_FORMAT).isBefore(
				moment(toTimeVal, TIME_FORMAT),
			)
				? null
				: { fromTime: true };
		};
	}

	private static _splitSingleTimeValue(value: string): [string, string] {
		if (value.includes(TimeValidators.TIME_SEPARATOR)) {
			return TimeValidators._splitTimeByColon(value);
		}

		const hour = value.substring(0, 2);
		const minutes = value.substring(2);

		return [hour, minutes];
	}

	private static _splitProvidedTime(time: string): {
		fromTime: string;
		toTime: string;
	} {
		const splittedTime = time.split('-');
		const fromTime = splittedTime[0].trim();
		const toTime = splittedTime[1].trim();

		return { fromTime, toTime };
	}

	private static _splitControlDateValue(control: AbstractControl): string[] {
		return control.value.split(',');
	}

	private static _splitTimeByColon(value: string): [string, string] {
		const [hour, minutes] = value
			.split(TimeValidators.TIME_SEPARATOR)
			.map((part) => part.trim());

		return [hour, minutes];
	}

	private static _isInvalidSingleTime(
		hourNumber: number,
		minutesNumber: number,
	): boolean {
		return (
			isNaN(hourNumber) ||
			isNaN(minutesNumber) ||
			hourNumber < 0 ||
			hourNumber > 23 ||
			minutesNumber < 0 ||
			minutesNumber > 59
		);
	}

	private static _isTimeEmpty(fromTime: string, toTime: string): boolean {
		return !fromTime || !toTime || fromTime === 'null' || toTime === 'null';
	}
}
