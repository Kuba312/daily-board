import {
	DestroyRef,
	Injectable,
	Signal,
	WritableSignal,
	computed,
	inject,
	signal,
} from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DEFAULT_LANGUAGE } from '@core/app.consts';
import moment from 'moment';
import { LocaleDateFormat } from '@core/types/dates.types';
import 'moment/locale/pl';
import { WeekRange } from '../../models/week-range';

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

	public getCurrentDay(): string {
		const currentDay = moment().toISOString();

		return currentDay;
	}

	public changeLocalDateBasedOnLanguageChange(): void {
		this._translateService.onLangChange
			.pipe(takeUntilDestroyed(this._destroyRef))
			.subscribe((langSettings: LangChangeEvent) => {
				this._setLocaleDateFormat(langSettings);
			});
	}

	public getMonthsDaysChunksByDate(date: string): string[][] {
		const momentDate = moment(date, 'YYYY-MM-DD');
		const numberOfDays = moment(momentDate).daysInMonth();
		const firstDayOfMonth = momentDate.startOf('month').isoWeekday();
		const paddingDays = firstDayOfMonth === 1 ? 0 : firstDayOfMonth - 1;
		const days = this._createRangeDaysMonth(numberOfDays, paddingDays);

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

	private _createRangeDaysMonth(end: number, paddingDays: number): string[] {
		const paddedDays: string[] = [];

		this._createEmptyDaysUntilFirstMonthDay(paddingDays, paddedDays);
		this._createCalendarDays(end, paddedDays);

		return paddedDays;
	}

	private _createCalendarDays(end: number, paddedDays: string[]): void {
		for (let day = 1; day <= end; day++) {
			const dayStr = day < 10 ? `0${day}` : `${day}`;

			paddedDays.push(dayStr);
		}
	}

	private _createEmptyDaysUntilFirstMonthDay(
		paddingDays: number,
		paddedDays: string[],
	): void {
		for (let i = 0; i < paddingDays; i++) {
			paddedDays.push('');
		}
	}

	private _splitDaysIntoDaysChunks(days: string[]): string[][] {
		return days.reduce((result: string[][], item, i) => {
			const chunkIndex = Math.floor(i / 7);

			if (!result[chunkIndex]) {
				result[chunkIndex] = [];
			}

			result[chunkIndex].push(item);

			return result;
		}, []);
	}
}
