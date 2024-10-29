import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'hiddenPartialHourClass',
	standalone: true,
})
export class HiddenPartialHourClassPipe implements PipeTransform {
	transform(time: string, hiddenClass: string): Record<string, boolean> {
		const isPartialHour = this.isPartialHour(time);

		return { [hiddenClass]: isPartialHour };
	}

	private isPartialHour(time: string): boolean {
		const [, minutes] = time.split(':');
		return minutes !== '00';
	}
}
