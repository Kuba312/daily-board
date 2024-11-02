import { compareTimeString } from '@shared/helpers/compare-time-strings.helper';
import { SortSequence } from '@core/types/sort.types';
import { DutyDto } from 'src/api/models';

export function compareDuties(duty1: DutyDto, duty2: DutyDto): SortSequence {
	if (!duty1.from || !duty1.to || !duty2.from || !duty2.to) {
		throw new Error(
			"Both duties must have 'from' and 'to' properties defined.",
		);
	}

	const fromComparison = compareTimeString(duty1.from, duty2.from);

	if (fromComparison !== 0) {
		return fromComparison;
	}

	return compareTimeString(duty1.to, duty2.to);
}
