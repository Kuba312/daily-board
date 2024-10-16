import {
	computed,
	Injectable,
	Signal,
	signal,
	WritableSignal,
} from '@angular/core';
import { Option } from '@core/types/basics.types';

@Injectable({ providedIn: 'root' })
export class TimeValueConnectorService {
	private _timeValueFrom: WritableSignal<Option<string>> = signal(null);
	private _timeValueTo: WritableSignal<Option<string>> = signal(null);

	timeValueFrom: Signal<Option<string>> = computed(() =>
		this._timeValueFrom(),
	);
	timeValueTo: Signal<Option<string>> = computed(() => this._timeValueTo());

	changeTimeFromValue(value: string): void {
		this._timeValueFrom.set(value);
	}

	changeTimeToValue(value: string): void {
		this._timeValueTo.set(value);
	}
}
