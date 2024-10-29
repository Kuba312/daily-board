import {
	computed,
	Injectable,
	Signal,
	signal,
	WritableSignal,
} from '@angular/core';
import moment from 'moment';

@Injectable({ providedIn: 'root' })
export class TimeManagerService {
	private readonly START_TIME: string = '7:00';
	private readonly END_TIME: string = '22:05';

	public alreadyProvidedTimelineValues: Signal<string[]> = computed(() =>
		this._alreadyProvidedTimelineValues(),
	);

	private _alreadyProvidedTimelineValues: WritableSignal<string[]> = signal(
		[],
	);

	createTimeLineEveryNumOfMinutes(minutes: number): string[] {
		const timelineEveryNumOfMinutes: string[] = [];
		const endTime = moment(this.END_TIME, 'HH:mm');

		let startTime = moment(this.START_TIME, 'HH:mm');

		while (startTime.isBefore(endTime)) {
			timelineEveryNumOfMinutes.push(startTime.format('HH:mm'));
			startTime = startTime.add(minutes, 'minutes');
		}

		const alreadyProvidedTimelineValues =
			this._alreadyProvidedTimelineValues();

		if (!alreadyProvidedTimelineValues.length) {
			this._alreadyProvidedTimelineValues.set(timelineEveryNumOfMinutes);
		}

		return timelineEveryNumOfMinutes;
	}
}
