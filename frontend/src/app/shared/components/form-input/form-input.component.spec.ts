import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { IConfig, NGX_MASK_CONFIG, NgxMaskDirective } from 'ngx-mask';
import { FormErrorMessageComponent } from '../form-error-message/form-error-message.component';
import FormInputComponent from './form-input.component';

describe('FormInputComponent', () => {
	let fixture: ComponentFixture<FormInputComponent>;
	let component: FormInputComponent;
	let el: DebugElement;
	let formGroupMock: FormGroup;

	const controlName = 'name';

	const maskConfig: Partial<IConfig> = {
		validation: false,
	};

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				FormInputComponent,
				MatIconModule,
				MatInputModule,
				MatFormFieldModule,
				NgxMaskDirective,
				MockComponent(FormErrorMessageComponent),
				NoopAnimationsModule,
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
					name: new FormControl('', Validators.required),
				});
				el = fixture.debugElement;
				fixture.componentRef.setInput('formGroup', formGroupMock);
				fixture.componentRef.setInput('controlName', controlName);
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should render form message component', () => {
		const formMessageErrorComponent = el.query(
			By.directive(FormErrorMessageComponent),
		);

		expect(formMessageErrorComponent).toBeTruthy();
	})

	it('should display mat icon if it is provided', () => {
		fixture.componentRef.setInput('matIcon', 'close');
		fixture.detectChanges();

		const matIcon = el.query(By.css('mat-icon'));

		expect(matIcon).toBeTruthy();
	})

	it('should display value in input if it is provided', () => {
		const value = "Test value";
		const inputElement = el.query(By.css('input')).nativeElement;

		inputElement.value = value;
		inputElement.dispatchEvent(new Event('input'));
		fixture.detectChanges();

		expect(formGroupMock.get(controlName)?.value).toBe(value);
	})
});
