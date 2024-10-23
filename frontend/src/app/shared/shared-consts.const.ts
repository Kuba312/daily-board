import { DurationInputArg2 } from 'moment';

export const DATE_REGEX: RegExp =
	/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

export const TIME_FORMAT: string = 'HH:mm';
export const TIME_MASK_FORMAT: string = '00:00';
export const MOMENT_MINUTES_TYPE: DurationInputArg2 = 'minutes';
export const YEAR_MOTH_DAY_FORMAT: string = 'YYYY-MM-DD';
export const YEAR_MONTH_FORMAT: string = 'YYYY-MM';

export const TILE_COLORS: string[] = [
	'#E27D60', // Soft Coral
	'#85C1E9', // Light Sky Blue
	'#B39DDB', // Lavender
	'#78C091', // Soft Sage
	'#FFB88C', // Peach
	'#C39BD3', // Muted Orchid
	'#F7DC6F', // Soft Yellow
	'#82CA9D', // Mint Green
	'#F0A07E', // Light Salmon
	'#A3CED2', // Soft Aqua
	'#E3B2A9', // Pale Rose
	'#F8C471', // Soft Apricot
	'#B4A7D6', // Pastel Purple
	'#92A9BD', // Cloudy Blue
	'#DBA997', // Muted Clay
	'#A5D8B0', // Light Teal
	'#F4B6C2', // Baby Pink
	'#BDC3C7', // Silver Gray
	'#B9A58D', // Sand Beige
	'#B39B72', // Soft Taupe
	'#73A9AD', // Dusty Teal
	'#D5A6BD', // Dusty Lilac
	'#9FC29F', // Soft Green
	'#F19E94', // Pale Coral
	'#A7C3B4', // Moss Green
	'#C6B39B', // Light Tan
	'#F3A683', // Warm Peach
	'#7E8E98', // Slate Gray
	'#C68F70', // Burnt Peach
	'#8AA29E', // Mist Green
  ];