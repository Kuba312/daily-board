import { AbstractControl, ValidatorFn } from '@angular/forms';
import moment from 'moment';
import { DATE_REGEX, TIME_FORMAT } from '../constants/shared-consts.const';

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

			if (
				!TimeValidators._isValidTimeFormat(fromTime) ||
				!TimeValidators._isValidTimeFormat(toTime)
			) {
				return { fromTime: true };
			}

			return TimeValidators._timeIsInvalid(fromTime, toTime);
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

	static validFullTime(): ValidatorFn {
		return (control: AbstractControl) => {
			if (!control.value) {
				return null;
			}

			const [, time] = TimeValidators._splitControlDateValue(control);
			const { fromTime, toTime } =
				TimeValidators._splitProvidedTime(time);

			return TimeValidators._isFullHour(fromTime) &&
				TimeValidators._isFullHour(toTime)
				? null
				: { incompleteHour: true };
		};
	}

	static validateTimeRanges(
		minFromHour: string,
		maxFromHour: string,
	): ValidatorFn {
		return (control: AbstractControl) => {
			if (!control.value) {
				return null;
			}

			const [, time] = TimeValidators._splitControlDateValue(control);
			const { fromTime, toTime } =
				TimeValidators._splitProvidedTime(time);

			const minTime = moment(minFromHour, TIME_FORMAT);
			const maxTime = moment(maxFromHour, TIME_FORMAT);
			const fromTimeMoment = moment(fromTime, TIME_FORMAT);
			const toTimeMoment = moment(toTime, TIME_FORMAT);

			return fromTimeMoment.isBefore(minTime) ||
				fromTimeMoment.isAfter(maxTime) ||
				toTimeMoment.isAfter(maxTime) ||
				toTimeMoment.isBefore(minTime)
				? { invalidRangeTime: true }
				: null;
		};
	}

	static validateEnoughTimeDifference(): ValidatorFn {
		return (control: AbstractControl) => {
			if (!control.value) {
				return null;
			}

			const [, time] = TimeValidators._splitControlDateValue(control);
			const { fromTime, toTime } =
				TimeValidators._splitProvidedTime(time);

			return TimeValidators._isEnoughTimeDifference(fromTime, toTime)
				? null
				: { invalidTimeDifference: true };
		};
	}

	private static _isEnoughTimeDifference(
		fromTime: string,
		toTime: string,
	): boolean {
		const from = moment(fromTime, 'HH:mm');
		const to = moment(toTime, 'HH:mm');
		const differenceInHours = to.diff(from, 'hours');

		return differenceInHours >= 5;
	}

	private static _isFullHour(value: string): boolean {
		// Regex to match 'HH:00' format, where HH is any valid hour (00 to 23)
		return /^([01]\d|2[0-3]):00$/.test(value);
	}

	private static _timeIsInvalid(
		fromTime: string,
		toTime: string,
	): { fromTime: boolean } | null {
		return moment(fromTime, TIME_FORMAT).isAfter(
			moment(toTime, TIME_FORMAT) ||
				!TimeValidators._isValidTimeFormat(fromTime) ||
				!TimeValidators._isValidTimeFormat(toTime),
		)
			? { fromTime: true }
			: null;
	}

	private static _isValidTimeFormat(time: string): boolean {
		const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/;

		return timeFormat.test(time);
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
