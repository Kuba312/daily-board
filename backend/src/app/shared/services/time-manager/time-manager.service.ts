import { Injectable } from '@angular/core';
import moment from 'moment';

@Injectable({ providedIn: 'root' })
export class TimeManagerService {
	private readonly START_TIME: string = '7:00';
	private readonly END_TIME: string = '22:05';

	createTimeLineEveryNumOfMinutes(minutes: number): string[] {
		const timelineEveryNumOfMinutes: string[] = [];
		const endTime = moment(this.END_TIME, 'HH:mm');

		let startTime = moment(this.START_TIME, 'HH:mm');

		while (startTime.isBefore(endTime)) {
			timelineEveryNumOfMinutes.push(startTime.format('HH:mm'));
			startTime = startTime.add(minutes, 'minutes');
		}

		return timelineEveryNumOfMinutes;
	}
}
