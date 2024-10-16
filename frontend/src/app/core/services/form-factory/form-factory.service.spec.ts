import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormFactory } from './form-factory.service';
import { FormConfig } from '@core/models/form-config';
import { FormControl, Validators } from '@angular/forms';
import { asyncMockValidator } from 'src/mocks/mock-data';

describe('FormFactory', () => {
	let formFactory: FormFactory;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			providers: [FormFactory],
		})
			.compileComponents()
			.then(() => {
				formFactory = TestBed.inject(FormFactory);
			});
	}));

	it('should create form group without validators', () => {
		const controls = {
			controls: {
				name: new FormControl(''),
			},
		} satisfies FormConfig;

		const formGroup = formFactory.createForm(controls);

		expect(formGroup).toBeTruthy();
		expect(formGroup.controls['name']).toBeTruthy();
	});

	it('should create formGroup with validator', () => {
		const controls = {
			controls: {
				name: new FormControl(''),
			},
			validators: [Validators.required],
		} satisfies FormConfig;

		const formGroup = formFactory.createForm(controls);

		expect(formGroup).toBeTruthy();
		expect(formGroup.hasValidator(Validators.required)).toBeTruthy();		
	});

	it('should create formGroup with async validator', () => {
		const asyncValidator = asyncMockValidator();
		const controls = {
			controls: {
				name: new FormControl(''),
			},
			asyncValidators: asyncValidator,
		} satisfies FormConfig;
		const formGroup = formFactory.createForm(controls);

		expect(formGroup).toBeTruthy();
		expect(formGroup.hasAsyncValidator(asyncValidator)).toBeTruthy();		
	});
});
