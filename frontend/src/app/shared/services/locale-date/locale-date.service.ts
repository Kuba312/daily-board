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
import { Option } from '@core/types/basics.types';
import { DayDate } from '@shared/models/date-day';
import { DEFAULT_LANGUAGE } from '@core/app.consts';
import { LocaleDateFormat } from '@core/types/dates.types';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import 'moment/locale/pl';
import { WeekRange } from '../../models/week-range';
import { YEAR_MONTH_FORMAT, YEAR_MOTH_DAY_FORMAT } from '@shared/shared-consts.const';

@Injectable({ providedIn: 'root' })
export class LocaleDateService {
	private readonly _translateService: TranslateService =
		inject(TranslateService);
	private readonly _destroyRef: DestroyRef = inject(DestroyRef);

	private readonly WEEK: moment.unitOfTime.StartOf = 'week';

	public localeDateFormat: Signal<LocaleDateFormat> = computed(() =>
		this._localeDateFormat(),
	);

	private readonly PL: LocaleDateFormat = 'pl';
	private readonly EN: LocaleDateFormat = 'en';

	private _localeDateFormat: WritableSignal<LocaleDateFormat> =
		signal<LocaleDateFormat>(this.PL);

	public weekRange(): WeekRange {
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
}
