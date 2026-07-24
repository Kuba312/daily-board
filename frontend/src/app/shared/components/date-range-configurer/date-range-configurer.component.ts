import { Component, input, InputSignal } from '@angular/core';
import { Option } from '@core/types/basics.types';
import { WeekRange } from '@shared/models/week-range';
import { DisplayDateMode } from '@shared/types/display-date-mode.type';
import LocaleDatePipe from '@shared/pipes/locale-date.pipe';
import SafeValue from '@shared/pipes/safe-value.pipe';

@Component({
    selector: 'app-date-range-configurer',
    imports: [LocaleDatePipe, SafeValue],
    styles: ':host { display: block }',
    templateUrl: './date-range-configurer.component.html',
})
export class DateRangeConfigurerComponent {
	public properDateDisplayMode: InputSignal<DisplayDateMode> =
		input.required<DisplayDateMode>();

	public readonly DAY_MONTH_FORMAT: string = 'DD MMMM';
	public readonly DAY_MONTH_YEAR_FORMAT: string = 'DD MMMM YYYY';

	public isWeekRange(value: DisplayDateMode): value is WeekRange {
		return (
			this._isNonNullValue(value) &&
			typeof value === 'object' &&
			'startOfWeek' in value
		);
	}

	public isDayRange(value: DisplayDateMode): value is string {
		return this._isNonNullValue(value) && typeof value === 'string';	
	}

	public isStartOfWeek(startOfWeek: Option<WeekRange>): boolean {
		return !!startOfWeek && !!startOfWeek.startOfWeek;
	}

	private _isNonNullValue<T>(value: Option<T>): value is T {
		return value !== null;
	}

	get getWeekRange(): Option<WeekRange> {
		const properDateDisplayMode = this.properDateDisplayMode();

		if (!this.isWeekRange(properDateDisplayMode)) {
			return null;
		}

		const { startOfWeek, endOfWeek } = properDateDisplayMode;

		return {
			startOfWeek,
			endOfWeek,
		};
	}

	get getCurrentDay(): Option<string> {
		const properDateDisplayMode = this.properDateDisplayMode();

		if (!this.isDayRange(properDateDisplayMode)) {
			return null;
		}

		return properDateDisplayMode;
	}

}
