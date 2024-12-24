import {
	computed,
	inject,
	Injectable,
	signal,
	Signal,
	WritableSignal,
} from '@angular/core';
import { WeekDays } from '@app/enums/week-days.enum';
import { WEEK_DAYS } from '@core/app.consts';
import {
	DAY_MONTH_FORMAT,
	YEAR_MOTH_DAY_FORMAT,
} from '@shared/constants/shared-consts.const';
import moment from 'moment';
import { DutyDto } from 'src/api/models';
import { DateHelperService } from '../locale-date/date-helper.service';
import { WeekBoundary } from '@shared/types/week-range.type';

@Injectable({ providedIn: 'root' })
export class DutyHelperService {
	private _dateHelperService: DateHelperService = inject(DateHelperService);

	public amountOfDuties: Signal<number> = computed(() =>
		this._amountOfDuties(),
	);

	private _amountOfDuties: WritableSignal<number> = signal<number>(0);

	public setAmountOfDuties(amount: number): void {
		this._amountOfDuties.set(amount);
	}

	public groupDutiesByDays(
		duties: Signal<DutyDto[]>,
	): Map<string, DutyDto[]> {
		const providedDuties = duties();
		const groupDuties = new Map<string, DutyDto[]>(
			this._getWeekDaysForBoard(),
		);

		for (const duty of providedDuties) {
			if (!duty.weekDay) {
				continue;
			}

			groupDuties.get(this._getDutyKey(duty))?.push(duty);
		}

		return groupDuties;
	}

	public groupDutiesNamesByColors(duties: DutyDto[]): Map<string, string[]> {
		const groupedDutiesNamesByColors = new Map<string, string[]>();

		for (const duty of duties) {
			const { color, name } = duty;

			if (!color || !name) {
				continue;
			}

			const normalizedName = this._adjustLettersAndSpaces(name);

			if (!groupedDutiesNamesByColors.has(color)) {
				groupedDutiesNamesByColors.set(color, []);
			}

			const currentNames = groupedDutiesNamesByColors.get(color)!;

			if (
				this._isNameUniqueAmongCurrentNames(
					currentNames,
					normalizedName,
				)
			) {
				currentNames.push(name);
			}
		}

		return groupedDutiesNamesByColors;
	}

	public crateArrayOfDutiesBasedOnWeekDays(
		days: WeekDays[],
		duty: DutyDto,
	): DutyDto[] {
		return days.map((day) => ({
			...duty,
			weekDay: day,
		}));
	}

	public createArrayOfDutiesBasedOnTimes(
		times: string[],
		duty: DutyDto,
	): DutyDto[] {
		return times.map((time) => {
			const [date, from, to] =
				this._dateHelperService.splitDateTimeRange(time);
			const formattedDate = moment(date, DAY_MONTH_FORMAT);
			const effectiveDate = formattedDate.format(YEAR_MOTH_DAY_FORMAT);
			const weekDay = WEEK_DAYS[formattedDate.isoWeekday() - 1];

			return {
				...duty,
				effectiveDate,
				from,
				to,
				weekDay,
			};
		});
	}

	public adjustCurrentWeekDatesToYearMonthDayFormat(): WeekBoundary {
		const weekRange = this._dateHelperService.currentWeekRange();
		const { startOfWeek, endOfWeek } = weekRange;
		const startOfWeekFormatted =
			this._dateHelperService.adjustDateToYearMonthDayFormat(startOfWeek);
		const endOfWeekFormatted =
			this._dateHelperService.adjustDateToYearMonthDayFormat(endOfWeek);

		return [startOfWeekFormatted, endOfWeekFormatted];
	}

	private _getDutyKey(duty: DutyDto): string {
		return `planner.full-days-names.${duty?.weekDay?.toLowerCase() ?? ''}`;
	}

	private _getWeekDaysForBoard(): Iterable<readonly [string, DutyDto[]]> {
		return [
			['planner.full-days-names.monday', []],
			['planner.full-days-names.tuesday', []],
			['planner.full-days-names.wednesday', []],
			['planner.full-days-names.thursday', []],
			['planner.full-days-names.friday', []],
			['planner.full-days-names.saturday', []],
			['planner.full-days-names.sunday', []],
		];
	}

	private _isNameUniqueAmongCurrentNames(
		currentNames: string[],
		normalizedName: string,
	): boolean {
		return !currentNames.some(
			(existingName) =>
				existingName.trim().toLowerCase().replace(/\s+/g, '') ===
				normalizedName,
		);
	}

	private _adjustLettersAndSpaces(name: string): string {
		return name.trim().toLowerCase().replace(/\s+/g, '');
	}
}
