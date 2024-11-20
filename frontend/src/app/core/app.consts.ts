// Languages
export const DEFAULT_LANGUAGE: string = 'pl-PL';
export const EN_GB: string = 'en-GB';

// Dark mode
export const DARK_MODE_KEY: string = 'daily-board.dark-mode';
export const DARK_MODE_CLASS: string = 'dark-mode';

// saved dialogs
export const DIALOGS_TO_NOT_SHOW: string = 'daily-board.dialogs-to-not-show';

export const SHORTCUTS_DAYS: Map<string, string> = new Map<string, string>([
	['planner.full-days-names.monday', 'planner.short-days-names.monday'],
	['planner.full-days-names.tuesday', 'planner.short-days-names.tuesday'],
	['planner.full-days-names.wednesday', 'planner.short-days-names.wednesday'],
	['planner.full-days-names.thursday', 'planner.short-days-names.thursday'],
	['planner.full-days-names.friday', 'planner.short-days-names.friday'],
	['planner.full-days-names.saturday', 'planner.short-days-names.saturday'],
	['planner.full-days-names.sunday', 'planner.short-days-names.sunday'],
]);

export const SHORT_NAME_DAYS: string[] = [
	'planner.short-days-names.monday',
	'planner.short-days-names.tuesday',
	'planner.short-days-names.wednesday',
	'planner.short-days-names.thursday',
	'planner.short-days-names.friday',
	'planner.short-days-names.saturday',
	'planner.short-days-names.sunday',
];

export const EMPTY_CUSTOM_MESSAGE: string = '';

// error codes
export const CONFLICT_ERROR_STATUS: number = 409;

// custom snackbar times
export const DUTIES_CONFLICT_MESSAGE_TIME: number = 6000;