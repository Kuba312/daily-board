import { Pipe, PipeTransform } from '@angular/core';
import { Option } from '@core/types/basics.types';

@Pipe({
	standalone: true,
	name: 'safeValue',
})
export default class SafeValue implements PipeTransform {
	transform(value: Option<string>): string {
		return value ?? '';
	}
}
