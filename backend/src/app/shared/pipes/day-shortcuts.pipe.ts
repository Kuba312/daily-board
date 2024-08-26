import { Pipe, PipeTransform } from '@angular/core';
import { SHORTCUTS_DAYS } from '@core/app.consts';

@Pipe({
	name: 'dayShortcutResponsive',
	standalone: true,
})

export class DayShortcutResponsivePipe implements PipeTransform {
	public readonly BREAK_POINT: number = 1500;

	transform(value: string, width: number): string {
		return width <= this.BREAK_POINT ? SHORTCUTS_DAYS.get(value) ?? '' : value;
	}
}