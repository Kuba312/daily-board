import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'translatePath',
	standalone: true,
})
export class TranslatePath<T> implements PipeTransform {
	transform(value: T, translateKey: string, toLowerCase?: boolean): string {		
		return `${translateKey}.${
			toLowerCase && typeof value === 'string'
				? value.toLowerCase()
				: value
		}`;
	}
}
