import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { click } from '@core/utils/test.utils';
import { TranslateModule } from '@ngx-translate/core';
import { TranslatePath } from '@shared/pipes/translate-path.pipe';
import { MockComponent } from 'ng-mocks';
import { MOCK_DAY_OPTIONS } from 'src/mocks/mock-data';
import FormErrorMessageComponent from '../form-error-message/form-error-message.component';
import FormSelectComponent from './form-select.component';

describe('FormSelectComponent', () => {
	let fixture: ComponentFixture<FormSelectComponent<string>>;
	let component: FormSelectComponent<string>;
	let el: DebugElement;	
	let formGroupMock: FormGroup;

	const controlName = 'day';

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				FormSelectComponent,
				MockComponent(FormErrorMessageComponent),
				ReactiveFormsModule,
				MatInputModule,
				MatFormFieldModule,
				MatSelectModule,
				TranslateModule.forRoot(),
				TranslatePath,
				NoopAnimationsModule,
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(FormSelectComponent<string>);
				component = fixture.componentInstance;
				formGroupMock = new FormGroup({
					day: new FormControl('', Validators.required),
				});
				el = fixture.debugElement;
				fixture.componentRef.setInput('formGroup', formGroupMock);
				fixture.componentRef.setInput('controlName', controlName);
				fixture.componentRef.setInput('options', MOCK_DAY_OPTIONS);
				fixture.componentRef.setInput('translateKey', 'planner.full-days-names');
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
	});

	it('should roll all options if user click on select', () => {
		const selectElement = el.query(By.css('.mat-mdc-select-trigger'));

		click(selectElement);

		fixture.detectChanges();

		const options = el.queryAll(By.css('mat-option'));
	
		expect(options.length).toBe(7);
	})

	it('should select proper option if user click on particular value in select', () => {
		const selectElement = el.query(By.css('.mat-mdc-select-trigger'));

		click(selectElement);
		fixture.detectChanges();

		const option = el.query(By.css('mat-option'));

		click(option);

		fixture.detectChanges();

		const selectedValue = el.query(By.css('.mat-mdc-select-min-line'));
		
		expect(selectedValue.nativeElement.innerText).toBe('planner.full-days-names.monday');
	})
	
});
