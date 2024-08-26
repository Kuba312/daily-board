import {
	Pipe,
	PipeTransform,
	effect,
	inject,
} from '@angular/core';
import { LocaleDateFormat } from '@core/types/dates.types';
import moment from 'moment';
import { LocaleDateService } from '../services/locale-date/locale-date.service';

@Pipe({
	name: 'momentDate',
	standalone: true,
	pure: false,
})
export default class LocaleDatePipe implements PipeTransform {
	private readonly _localeDateService: LocaleDateService =
		inject(LocaleDateService);

	private _currentLanguage: LocaleDateFormat = 'pl';

	constructor() {
		this._recalculateLocaleDateFormat();
	}

	transform(value: string, format: string): string {
		if (!value) {
			return '';
		}

		return moment(value).locale(this._currentLanguage).format(format);
	}

	private _recalculateLocaleDateFormat(): void {
		effect(() => {
			const currentFormat = this._localeDateService.localeDateFormat();

			if (!currentFormat) {
				return;
			}

			this._currentLanguage = currentFormat;
		});
	}
}
