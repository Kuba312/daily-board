import { Injectable, Signal } from '@angular/core';
import { WeekDays } from '@app/enums/week-days.enum';
import { DutyDto } from 'src/api/models';

@Injectable({ providedIn: 'root' })
export class DutyHelperService {
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

			groupDuties.get(this.getDutyKey(duty))?.push(duty);
		}

		return groupDuties;
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

	private getDutyKey(duty: DutyDto): string {
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
}
