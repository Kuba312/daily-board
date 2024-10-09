import { AbstractControl, AsyncValidatorFn, ValidatorFn } from '@angular/forms';

export interface FormConfig {
	controls: Record<string, AbstractControl>;
	validators?: ValidatorFn | ValidatorFn[];
	asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[];
}
