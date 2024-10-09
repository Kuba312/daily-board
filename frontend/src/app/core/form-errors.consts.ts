/* eslint-disable @typescript-eslint/naming-convention */

export enum ValidatorNames {
	REQUIRED = 'required',
	EMAIL = 'email',
	PATTERN = 'pattern',
	MIN_LENGTH = 'minlength',
	MAX_LENGTH = 'maxlength',
	MIN = 'min',
	DATE = 'date',
	SPECIAL_CHARACTERS = 'containSpecialCharacters',
	FROM_DATE = 'fromDate'
}

export const ValidatorsImportanceOrderList: ValidatorNames[] = [
	ValidatorNames.REQUIRED,
	ValidatorNames.EMAIL,
	ValidatorNames.PATTERN,
	ValidatorNames.MIN_LENGTH,
	ValidatorNames.MAX_LENGTH,
	ValidatorNames.DATE,
	ValidatorNames.SPECIAL_CHARACTERS,
	ValidatorNames.FROM_DATE,
	ValidatorNames.MIN,
];

export const FORM_ERROR_MESSAGES: { [keys in ValidatorNames]: string } = {
	[ValidatorNames.REQUIRED]: 'form-validators.required',
	[ValidatorNames.EMAIL]: 'form-validators.email',
	[ValidatorNames.PATTERN]: 'form-validators.pattern',
	[ValidatorNames.MIN_LENGTH]: 'form-validators.min-length',
	[ValidatorNames.MAX_LENGTH]: 'form-validators.max-length',
	[ValidatorNames.DATE]: 'form-validators.date',
	[ValidatorNames.SPECIAL_CHARACTERS]: 'form-validators.special-characters',
	[ValidatorNames.FROM_DATE]: 'form-date.from-date',
	[ValidatorNames.MIN]: 'form-validators.min',
};
