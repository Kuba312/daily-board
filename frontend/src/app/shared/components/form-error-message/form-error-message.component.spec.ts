import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import FormErrorMessageComponent from './form-error-message.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

describe('FormErrorMessageComponent', () => {
	let fixture: ComponentFixture<FormErrorMessageComponent>;
	let component: FormErrorMessageComponent;
	let formGroupMock: FormGroup;
	
	const controlName = 'name';

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [FormErrorMessageComponent, TranslateModule.forRoot()],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(FormErrorMessageComponent);
				component = fixture.componentInstance;
				formGroupMock = new FormGroup({
					name: new FormControl('', Validators.required),
				});

				fixture.componentRef.setInput('formGroup', formGroupMock);
				fixture.componentRef.setInput('controlName', controlName);
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should not display error until control is not touched', () => {
		formGroupMock.get(controlName)?.markAsUntouched();

		expect(component.errorMessage).toBeFalsy();
	});

	it('should display error message if control has an error', () => {
		formGroupMock.get(controlName)?.markAsTouched();

		expect(component.errorMessage).toEqual('form-validators.required');
	});

	it('should display custom error', () => {
		const customError = 'Custom error';
		fixture.componentRef.setInput('customMessage', {
			required: customError,
		});
		formGroupMock.get(controlName)?.markAsTouched();

		expect(component.errorMessage).toEqual(customError);
	});

	it('should not display error if error is not defined in the error list', () => {
		const control = formGroupMock.get(controlName);

		control?.setValue("test");		
		control?.setErrors({ test: true });
		control?.markAsTouched();
		
		expect(component.errorMessage).toEqual("");
	});
});
