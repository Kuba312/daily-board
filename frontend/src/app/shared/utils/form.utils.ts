import { FormGroup } from "@angular/forms";

export function validateForm(formGroup: FormGroup): void {
	Object.keys(formGroup.controls).forEach((key) => {
		formGroup.controls[key].markAsTouched();
		formGroup.controls[key].markAsDirty();
	});
}
