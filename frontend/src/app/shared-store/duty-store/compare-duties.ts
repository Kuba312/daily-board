import { SortSequence } from '@core/types/sort.types';
import { DutyDto } from 'src/api/models';

export function compareDuties(duty1: DutyDto, duty2: DutyDto): SortSequence {
	if (!duty1.from || !duty1.to || !duty2.from || !duty2.to) {
		throw new Error("Both duties must have 'from' and 'to' properties defined.");
	}

	const fromComparison = compareTimeString(duty1.from, duty2.from);

	if (fromComparison !== 0) {
		return fromComparison;
	}

	return compareTimeString(duty1.to, duty2.to);
}

function compareTimeString(time1: string, time2: string): SortSequence {
	const [hour1, minute1] = time1.split(':').map(Number);
	const [hour2, minute2] = time2.split(':').map(Number);

	if (hour1 !== hour2) {
		return hour1 > hour2 ? 1 : -1;
	}

	if (minute1 !== minute2) {
		return minute1 > minute2 ? 1 : -1;
	}

	return 0;
}