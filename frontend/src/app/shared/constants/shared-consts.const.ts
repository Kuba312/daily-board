import { DurationInputArg2 } from 'moment';

export const DATE_REGEX: RegExp =
	/^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

export const TIME_FORMAT: string = 'HH:mm';
export const TIME_FORMAT_WITH_SECONDS: string = 'HH:mm:ss';
export const TIME_MASK_FORMAT: string = '00:00';
export const MOMENT_MINUTES_TYPE: DurationInputArg2 = 'minutes';
export const YEAR_MOTH_DAY_FORMAT: string = 'YYYY-MM-DD';
export const YEAR_MONTH_FORMAT: string = 'YYYY-MM';
export const DAY_MONTH_FORMAT: string = 'DD-MM-YYYY';

export const DYNAMIC_PLANNER: string = 'dynamic';
export const IS_DYNAMIC_PLANNER: string = 'isDynamic';
export const CONSTANT_PLANNER: string = 'constant';

export const PLANNER_ID: string = 'plannerId';

export const TIME_PLACEHOLDER: string = '__:__'
export const DATE_PLACEHOLDER: string = '__-__-____';

export const TILE_COLORS: string[] = [
	'#FF6F61', // Intensywny koralowy
	'#6CB6FF', // Jasny błękit
	'#FFD66B', // Żółty pastelowy
	'#4CAF50', // Zielony leśny
	'#F29C9F', // Blady różowy
	'#A47EBA', // Fioletowy pastelowy
	'#5D9CEC', // Jasny niebieski
	'#FFA177', // Łososiowy (bardziej odróżniający się pomarańczowy)
	'#91C46C', // Zielony limonkowy
	'#F4B183', // Brzoskwinia z domieszką różu
	'#D9776F', // Ceglasty czerwony
	'#6E9ECF', // Stonowany niebieski
	'#FA8072', // Łososiowy jasny
	'#9D89D9', // Jasny fiolet
	'#FFB347', // Jasna zieleń
	'#607D8B', // Złoty pastelowy
	'#82AAD3', // Pastelowy niebieski
	'#B8DE92', // Miętowa zieleń
	'#AB947E', // Beżowo-brązowy (unikatowy odcień) 
	'#FFCC99', // Delikatny brzoskwiniowy (jasny)
  ];