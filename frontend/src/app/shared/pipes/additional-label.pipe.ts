import { inject, Pipe, PipeTransform } from '@angular/core';
import { Option } from '@core/types/basics.types';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
	standalone: true,
	name: 'additionalLabel',
})
export class AdditionalLabelPipe implements PipeTransform {
	private readonly _translateService: TranslateService =
		inject(TranslateService);

	transform(value: string, label?: Option<string>): string {
		if (!label) {
			return this._translateService.instant(value);
		}

		return `${this._translateService.instant(
			value,
		)} ${label}`;
	}
}
