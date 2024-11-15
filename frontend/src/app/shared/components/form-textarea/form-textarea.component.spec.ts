import { TextFieldModule } from '@angular/cdk/text-field';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { FormErrorMessageComponent } from '../form-error-message/form-error-message.component';
import FormInputComponent from '../form-input/form-input.component';
import { IConfig, NGX_MASK_CONFIG, NgxMaskDirective } from 'ngx-mask';

describe('FormTextareaComponent', () => {
	let fixture: ComponentFixture<FormInputComponent>;
	let component: FormInputComponent;
	let el: DebugElement;
	let formGroupMock: FormGroup;

	const controlName = 'description';

	const maskConfig: Partial<IConfig> = {
		validation: false,
	};

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				FormInputComponent,
				MockComponent(FormErrorMessageComponent),
				MatInputModule,
				TextFieldModule,
				NgxMaskDirective,
				MatFormFieldModule,
				NoopAnimationsModule,
				ReactiveFormsModule,
				TranslateModule.forRoot(),
			],
			providers: [
				{ provide: NGX_MASK_CONFIG, useValue: maskConfig },
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(FormInputComponent);
				component = fixture.componentInstance;
				formGroupMock = new FormGroup({
					description: new FormControl(''),
				});
				el = fixture.debugElement;
				fixture.componentRef.setInput('formGroup', formGroupMock);
				fixture.componentRef.setInput('controlName', controlName);
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	})

	it('should render form message component', () => {
		const formMessageErrorComponent = el.query(
			By.directive(FormErrorMessageComponent),
		);

		expect(formMessageErrorComponent).toBeTruthy();
	}, 500)

	it('should display mat label if it is provided', () => {
		fixture.componentRef.setInput('label', 'Desc');

		const label = el.query(By.css('mat-label'));

		expect(label).toBeTruthy();
	})

	it('should display value in input if it is provided', () => {
		const value = "Test value";
		const inputElement = el.query(By.css('.mat-mdc-input-element')).nativeElement;

		inputElement.value = value;
		inputElement.dispatchEvent(new Event('textarea'));
		fixture.detectChanges();
	})

});
