import { DurationInputArg2 } from "moment";

export const DATE_REGEX: RegExp =
	/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/;

export const TIME_FORMAT: string = 'HH:mm';
export const TIME_MASK_FORMAT: string = '00:00';
export const MOMENT_MINUTES_TYPE: DurationInputArg2 = 'minutes';