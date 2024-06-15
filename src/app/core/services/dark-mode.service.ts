import {
	Injectable,
	Signal,
	WritableSignal,
	computed,
	inject,
	signal,
} from '@angular/core';
import { PersistanceService } from './persistance.service';
import { DARK_MODE_KEY } from '../app.consts';

@Injectable({ providedIn: 'root' })
export class DarkModeService {
	private readonly _persistanceService: PersistanceService =
		inject(PersistanceService);

	darkMode: Signal<boolean> = computed(() => this._darkMode());

	private _darkMode: WritableSignal<boolean> = signal<boolean>(
		this.savedDarkModeState,
	);

	toggleDarkMode(): void {
		this._darkMode.update((mode) => !mode);

		this._persistanceService.set<boolean>(DARK_MODE_KEY, this._darkMode());
	}

	get savedDarkModeState(): boolean {
		return this._persistanceService.get(DARK_MODE_KEY) === 'true';
	}
}
