import { Injectable, Signal } from '@angular/core';
import { adjustTimeInDuties } from '@shared/helpers/adjust-time-in-duties.helper';
import { DutyDto } from 'src/api/models';

@Injectable({ providedIn: 'root' })
export class DutyHelperService {
	public groupDutiesByDays(
		duties: Signal<DutyDto[]>,
	): Map<string, DutyDto[]> {
		const providedDuties = adjustTimeInDuties(duties());
		const groupDuties = new Map<string, DutyDto[]>(
			this._getWeekDaysForBoard(),
		);

		for (const duty of providedDuties) {
			if (!duty.weekDay) {
				continue;
			}

			groupDuties
				.get(this.getDutyKey(duty))
				?.push(duty);
		}

		return groupDuties;
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
