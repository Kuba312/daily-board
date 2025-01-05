import {
	Injectable,
} from '@angular/core';
import { TIME_FORMAT } from '@shared/constants/shared-consts.const';
import moment from 'moment';

@Injectable({ providedIn: 'root' })
export class TimeManagerService {
	private readonly START_TIME: string = '7:00';
	private readonly END_TIME: string = '22:05';

	public createTimeLineEveryNumOfMinutes(
		startTime: string = this.START_TIME,
		endTime: string = this.END_TIME,
		minutes: number,
	): string[] {
		const timelineEveryNumOfMinutes: string[] = [];
		const endTimeVal = moment(endTime, TIME_FORMAT).add(1, 'minutes');

		let startTimeVal = moment(startTime, TIME_FORMAT);

		while (startTimeVal.isBefore(endTimeVal)) {
			timelineEveryNumOfMinutes.push(startTimeVal.format(TIME_FORMAT));
			startTimeVal = startTimeVal.add(minutes, 'minutes');
		}

		return timelineEveryNumOfMinutes;
	}
}
