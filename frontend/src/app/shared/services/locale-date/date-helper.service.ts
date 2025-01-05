import {
	DestroyRef,
	Injectable,
	Signal,
	WritableSignal,
	computed,
	inject,
	signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DEFAULT_LANGUAGE } from '@core/app.consts';
import { Option } from '@core/types/basics.types';
import { LocaleDateFormat } from '@core/types/dates.types';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import {
	TIME_FORMAT,
	YEAR_MONTH_FORMAT,
	YEAR_MOTH_DAY_FORMAT,
} from '@shared/constants/shared-consts.const';
import { DayDate } from '@shared/models/date-day';
import moment from 'moment';
import 'moment/locale/pl';
import { WeekRange } from '../../models/week-range';
import { WeekBoundary } from '@shared/types/week-range.type';

@Injectable({ providedIn: 'root' })
export class DateHelperService {
	private readonly _translateService: TranslateService =
		inject(TranslateService);
	private readonly _destroyRef: DestroyRef = inject(DestroyRef);

	private readonly WEEK: moment.unitOfTime.StartOf = 'week';

	public localeDateFormat: Signal<LocaleDateFormat> = computed(() =>
		this._localeDateFormat(),
	);
	public updatedWeekPeriod: Signal<Option<WeekRange>> = computed(() =>
		this._updatedWeekPeriod(),
	);

	private readonly PL: LocaleDateFormat = 'pl';
	private readonly EN: LocaleDateFormat = 'en';

	private _localeDateFormat: WritableSignal<LocaleDateFormat> =
		signal<LocaleDateFormat>(this.PL);
	private _updatedWeekPeriod: WritableSignal<Option<WeekRange>> =
		signal<Option<WeekRange>>(null);

	public currentWeekRange(): WeekRange {
		const startOfWeek = moment().startOf(this.WEEK).toISOString();
		const endOfWeek = moment().endOf(this.WEEK).toISOString();

		return {
			startOfWeek,
			endOfWeek,
		};
	}

	public extractDayFromDate(date: string, isChosenDate?: boolean): string {
		const formattedDAte = moment(date).format(YEAR_MOTH_DAY_FORMAT);
		const splittedDate = formattedDAte.split('-');

		return isChosenDate ? splittedDate[1] : splittedDate[2];
	}

	public getCurrentDay(): string {
		const currentDay = moment().toISOString();

		return currentDay;
	}

	public getCurrentHour(): string { 
		return moment().format(TIME_FORMAT);
	}

	public adjustDateToYearMonthDayFormat(date: string): string {
		return moment(date).format(YEAR_MOTH_DAY_FORMAT);
	}

	public isDateTimesOverlapped(date: string, dateToCompare: string): boolean {
		const [currentDate, currentFrom, currentTo] =
			this.splitDateTimeRange(date);
		const [compareDate, compareFrom, compareTo] =
			this.splitDateTimeRange(dateToCompare);

		if (currentDate !== compareDate) {
			return false;
		}

		const currentFromMoment = moment(currentFrom, TIME_FORMAT, true);
		const currentToMoment = moment(currentTo, TIME_FORMAT, true);
		const compareFromMoment = moment(compareFrom, TIME_FORMAT, true);
		const compareToMoment = moment(compareTo, TIME_FORMAT, true);

		if (
			!currentFromMoment.isValid() ||
			!currentToMoment.isValid() ||
			!compareFromMoment.isValid() ||
			!compareToMoment.isValid()
		) {
			throw new Error('Invalid time format');
		}

		return (
			currentFromMoment.isBefore(compareToMoment) &&
			currentToMoment.isAfter(compareFromMoment)
		);
	}

	public dateToString(date: Option<string>, format: string): string {
		return moment(date, format).toISOString();
	}

	public stringToDate(date: Option<string>, format: string): string {
		return moment(date).format(format);
	}

	public changeLocalDateBasedOnLanguageChange(): void {
		this._translateService.onLangChange
			.pipe(takeUntilDestroyed(this._destroyRef))
			.subscribe((langSettings: LangChangeEvent) => {
				this._setLocaleDateFormat(langSettings);
			});
	}

	public splitDateTimeRange(date: string): [string, string, string] {
		const extractedDateAndTimes = date.split(',');
		const extractedDate = extractedDateAndTimes[0];

		const extractedTimes = extractedDateAndTimes[1]
			.split('-')
			.map((hour) => hour.trim());

		return [extractedDate, extractedTimes[0], extractedTimes[1]];
	}

	public getMonthsDaysChunksByDate(date: string): (DayDate | string)[][] {
		const momentDate = moment(date, YEAR_MOTH_DAY_FORMAT);
		const currentYearAndMonth = momentDate.format(YEAR_MONTH_FORMAT);

		const numberOfDays = moment(momentDate).daysInMonth();
		const firstDayOfMonth = momentDate.startOf('month').isoWeekday();
		const paddingDays = firstDayOfMonth === 1 ? 0 : firstDayOfMonth - 1;
		const days = this._createRangeDaysMonth(
			numberOfDays,
			paddingDays,
			currentYearAndMonth,
		);

		return this._splitDaysIntoDaysChunks(days);
	}

	public resetUpdatedWeekPeriod(): void { 
		this._updatedWeekPeriod.set(null);
	}

	public changeWeekPeriod(currentWeekIndex: number): WeekBoundary {
		const { startOfWeek, endOfWeek } = this.currentWeekRange();		
		const adjustedStartOfWeek = this._calculateNewWeek(
			startOfWeek,
			currentWeekIndex,
		);
		const adjustedEndOfWeek = this._calculateNewWeek(
			endOfWeek,
			currentWeekIndex,
		);

		this._propagateIsoWeekPeriod(adjustedStartOfWeek, adjustedEndOfWeek);
	
		return [adjustedStartOfWeek, adjustedEndOfWeek];
	}

	private _setLocaleDateFormat(langSettings: LangChangeEvent): void {
		const { lang } = langSettings;
		const langForDate = lang === DEFAULT_LANGUAGE ? this.PL : this.EN;

		moment.updateLocale(langForDate, {
			week: {
				dow: 1,
			},
		});
		moment.locale(langForDate);

		this._localeDateFormat.set(langForDate);
	}

	private _propagateIsoWeekPeriod(
		startOfWeek: string,
		endOfWeek: string,
	): void {
		const startOfWeekIsoFormat = moment(startOfWeek).toISOString();
		const endOfWeekIsoFormat = moment(endOfWeek).toISOString();

		this._updatedWeekPeriod.set({
			startOfWeek: startOfWeekIsoFormat,
			endOfWeek: endOfWeekIsoFormat,
		});
	}

	private _createRangeDaysMonth(
		end: number,
		paddingDays: number,
		currentYearAndMonth: string,
	): (DayDate | string)[] {
		const paddedDays: (DayDate | string)[] = [];

		this._createEmptyDaysUntilFirstMonthDay(paddingDays, paddedDays);
		this._createCalendarDays(end, paddedDays, currentYearAndMonth);

		return paddedDays;
	}

	private _createCalendarDays(
		end: number,
		paddedDays: (DayDate | string)[],
		currentYearAndMonth: string,
	): void {
		for (let day = 1; day <= end; day++) {
			const dayStr = day < 10 ? `0${day}` : `${day}`;

			paddedDays.push({
				date: `${currentYearAndMonth}-${dayStr}`,
				day: dayStr,
			});
		}
	}

	private _createEmptyDaysUntilFirstMonthDay(
		paddingDays: number,
		paddedDays: (DayDate | string)[],
	): void {
		for (let i = 0; i < paddingDays; i++) {
			paddedDays.push('');
		}
	}

	private _splitDaysIntoDaysChunks(
		days: (DayDate | string)[],
	): (DayDate | string)[][] {
		return days.reduce((result: (DayDate | string)[][], day, i) => {
			const chunkIndex = Math.floor(i / 7);

			if (!result[chunkIndex]) {
				result[chunkIndex] = [];
			}

			result[chunkIndex].push(day);

			return result;
		}, []);
	}

	private _calculateNewWeek(
		endOfWeek: string,
		currentWeekIndex: number,
	): string {
		return moment(endOfWeek)
			.add(currentWeekIndex * 7, 'days')
			.format(YEAR_MOTH_DAY_FORMAT);
	}
}
