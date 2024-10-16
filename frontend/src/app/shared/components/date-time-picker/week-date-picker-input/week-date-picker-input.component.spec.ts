import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import WeekDatePickerInputComponent from './week-date-picker-input.component';
import { DebugElement } from '@angular/core';
import {
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { TimeValidators } from '@shared/validators/time.validators';
import { By } from '@angular/platform-browser';
import CalendarWeeksRangerComponent from '../calendar-weeks-ranger/calendar-weeks-ranger.component';
import { MockComponent } from 'ng-mocks';
import { CalendarDateDetails } from '@shared/models/calendar-date-details';

describe('WeekDatePickerInputComponent', () => {
	let fixture: ComponentFixture<WeekDatePickerInputComponent>;
	let component: WeekDatePickerInputComponent;
	let el: DebugElement;
	let formGroupMock: FormGroup;

	const controlName = 'date';

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				WeekDatePickerInputComponent,
				MockComponent(CalendarWeeksRangerComponent),
				ReactiveFormsModule,
				MatInputModule,
				MatFormFieldModule,
				NgxMaskDirective,
				MatIconModule,
				NoopAnimationsModule,
				TranslateModule.forRoot(),
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(WeekDatePickerInputComponent);
				component = fixture.componentInstance;
				el = fixture.debugElement;
				formGroupMock = new FormGroup({
					date: new FormControl('', [
						Validators.required,
						TimeValidators.validateDate(),
						TimeValidators.validateTime(),
					]),
				});
				fixture.componentRef.setInput('formGroup', formGroupMock);
				fixture.componentRef.setInput('controlName', controlName);
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display date input', () => {
		const dateInputElement = el.query(
			By.css('.week-date-picker-input__form-field input'),
		);

		expect(dateInputElement).toBeTruthy();
	});

	it('should display from and to input', () => {
		const fromInputElement = el.queryAll(
			By.css('.date-range-container input'),
		);

		expect(fromInputElement[0]).toBeTruthy();
		expect(fromInputElement[1]).toBeTruthy();
	});

	it('should display week picker', () => {
		component.toggleCalendarWeek();
		fixture.detectChanges();

		const calendarWeeksRangerComponent = el.query(
			By.directive(CalendarWeeksRangerComponent),
		);

		expect(calendarWeeksRangerComponent).toBeTruthy();
	});

	it('should show error if date input is invalid ', () => {
		const dateControl = component.formGroup().get(controlName);
		const builtDate = '12-13-2024, 12:00 - 	13:00}';

		dateControl?.setValue(builtDate);

		fixture.detectChanges();

		expect(dateControl?.hasError('invalidDate')).toBeTrue();
	});

	it('should show error if time input is invalid ', () => {
		const dateControl = component.formGroup().get(controlName);
		const builtDate = '12-13-2024, 99:00 - 12:00}';

		dateControl?.setValue(builtDate);

		fixture.detectChanges();

		expect(dateControl?.hasError('fromTime')).toBeTrue();
	});

	it('should show error if from time is after to time input', () => {
		const dateControl = component.formGroup().get(controlName);
		const builtDate = '12-12-2024, 12:00 - 11:00}';

		dateControl?.setValue(builtDate);

		fixture.detectChanges();

		expect(dateControl?.hasError('fromTime')).toBeTrue();
	});

	it('should show error if times are empty', () => {
		const dateControl = component.formGroup().get(controlName);
		const builtDate = '12-12-2024, null - null}';

		dateControl?.setValue(builtDate);

		fixture.detectChanges();

		expect(dateControl?.hasError('emptyTime')).toBeTrue();
	});

	it('should update close state of calendar', () => {
		const calendarDatesDetails: CalendarDateDetails = {
			date: '2024-12-12',
			from: '12:00',
			to: '13:00',
		};

		component.toggleCalendarWeek();
		component.onCloseCalendarWeek(calendarDatesDetails);
		fixture.detectChanges();

		expect(component.isWeeklyCalendarOpened()).toBeFalse();
	});
	
});
