import { SortSequence } from "@core/types/sort.types";

export function compareTimeString(time1: string, time2: string): SortSequence {
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