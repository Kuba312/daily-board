import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TextProcessingService {
	public extractFromHourFromControl(value: string): string {
		const splittedValue = this._splitDateControl(value);

		console.log(splittedValue);

		return splittedValue[0];
	}

	public extractToHourFromControl(value: string): string {
		const splittedValue = this._splitDateControl(value);

		return splittedValue[1];
	}

	private _splitDateControl(value: string): string[] {
		const cleanedValue = value.replace(/[^\d:-]/g, '');
		const splittedValue = cleanedValue.split('-');
		return splittedValue;
	}
}
