import { SortSequence } from '@core/types/sort.types';
import { compareTimeString } from '@shared/helpers/compare-time-strings.helper';
import { PlannerDto } from 'src/api/models';

export function comparePlanners(
	planner1: PlannerDto,
	planner2: PlannerDto,
): SortSequence {
	if (
		!planner1.startTime ||
		!planner1.endTime ||
		!planner2.startTime ||
		!planner2.endTime
	) {
		throw new Error(
			"Both planners must have 'startTime' and 'endTime' properties defined.",
		);
	}

	const startComparison = compareTimeString(
		planner1.startTime,
		planner2.startTime,
	);

	if (startComparison !== 0) {
		return startComparison;
	}

	return compareTimeString(planner1.endTime, planner2.endTime);
}
