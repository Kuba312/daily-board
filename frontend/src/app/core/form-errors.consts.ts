/* eslint-disable @typescript-eslint/naming-convention */

import { EMPTY_CUSTOM_MESSAGE } from "./app.consts";

export enum ValidatorNames {
	REQUIRED = 'required',
	EMAIL = 'email',
	PATTERN = 'pattern',
	MIN_LENGTH = 'minlength',
	MAX_LENGTH = 'maxlength',
	MIN = 'min',
	DATE = 'date',
	SPECIAL_CHARACTERS = 'containSpecialCharacters',
	FROM_TIME = 'fromTime',
	INVALID_DATE = 'invalidDate',
	EMPTY_TIME = 'emptyTime',
	INCOMPLETE_HOUR = 'incompleteHour',
	INVALID_TIME_DIFFERENCE = 'invalidTimeDifference',
	INVALID_RANGE_TIME = 'invalidRangeTime',
	INVALID_TIME_DUTY_DIFFERENCE = 'invalidTimeDutyDifference'
}

export const ValidatorsImportanceOrderList: ValidatorNames[] = [
	ValidatorNames.REQUIRED,
	ValidatorNames.EMAIL,
	ValidatorNames.PATTERN,
	ValidatorNames.MIN_LENGTH,
	ValidatorNames.MAX_LENGTH,
	ValidatorNames.DATE,
	ValidatorNames.SPECIAL_CHARACTERS,
	ValidatorNames.MIN,
	ValidatorNames.INVALID_DATE,
	ValidatorNames.EMPTY_TIME,
	ValidatorNames.FROM_TIME,
	ValidatorNames.INCOMPLETE_HOUR,
	ValidatorNames.INVALID_TIME_DIFFERENCE,
	ValidatorNames.INVALID_RANGE_TIME,
	ValidatorNames.INVALID_TIME_DUTY_DIFFERENCE,
];

export const FORM_ERROR_MESSAGES: { [keys in ValidatorNames]: string } = {
	[ValidatorNames.REQUIRED]: 'form-validators.required',
	[ValidatorNames.EMAIL]: 'form-validators.email',
	[ValidatorNames.PATTERN]: 'form-validators.pattern',
	[ValidatorNames.MIN_LENGTH]: 'form-validators.min-length',
	[ValidatorNames.MAX_LENGTH]: 'form-validators.max-length',
	[ValidatorNames.DATE]: 'form-validators.date',
	[ValidatorNames.SPECIAL_CHARACTERS]: 'form-validators.special-characters',
	[ValidatorNames.MIN]: 'form-validators.min',
	[ValidatorNames.INVALID_DATE]: 'form-validators.invalid-date',
	[ValidatorNames.EMPTY_TIME]: 'form-validators.empty-time',
	[ValidatorNames.FROM_TIME]: 'form-validators.from-time',
	[ValidatorNames.INCOMPLETE_HOUR]: 'form-validators.incomplete-hours',
	[ValidatorNames.INVALID_TIME_DIFFERENCE]: 'form-validators.invalid-time-difference',
	[ValidatorNames.INVALID_TIME_DUTY_DIFFERENCE]: 'form-validators.invalid-time-duty-difference',
	[ValidatorNames.INVALID_RANGE_TIME]: EMPTY_CUSTOM_MESSAGE,
};
