import { DebugElement } from '@angular/core';
import {
	ComponentFixture,
	fakeAsync,
	TestBed,
	tick,
	waitForAsync,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KeyboardEventService } from '@shared/services/keyboard-events/keyboard-events.service';
import { TimeValueConnectorService } from '@shared/services/time-value-connector.service';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import CalendarTimeRangerComponent from './calendar-time-ranger.component';
import { TIME_FORMAT } from '@shared/constants/shared-consts.const';

describe('CalendarTimeRangerComponent', () => {
	let fixture: ComponentFixture<CalendarTimeRangerComponent>;
	let component: CalendarTimeRangerComponent;
	let timeValueConnectorServiceSpy: jasmine.SpyObj<TimeValueConnectorService>;
	let keyboardEventServiceSpy: jasmine.SpyObj<KeyboardEventService>;
	let el: DebugElement;

	const fromHourControl: string = 'fromHour';
	const toHourControl: string = 'toHour';

	beforeEach(waitForAsync(() => {
		timeValueConnectorServiceSpy = jasmine.createSpyObj(
			'TimeValueConnectorService',
			['changeTimeFromValue', 'changeTimeToValue'],
		);
		keyboardEventServiceSpy = jasmine.createSpyObj('KeyboardEventService', [
			'isInputFocused',
			'isArrowUpEvent',
			'isArrowDownEvent',
		]);

		TestBed.configureTestingModule({
			imports: [
				CalendarTimeRangerComponent,
				MatInputModule,
				MatFormFieldModule,
				ReactiveFormsModule,
				NgxMaskDirective,
				NoopAnimationsModule,
				TranslateModule.forRoot(),
			],
			providers: [
				{
					provide: TimeValueConnectorService,
					useValue: timeValueConnectorServiceSpy,
				},
				{
					provide: KeyboardEventService,
					useValue: keyboardEventServiceSpy,
				},
				provideNgxMask(),
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(CalendarTimeRangerComponent);
				component = fixture.componentInstance;
				el = fixture.debugElement;
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should form has proper controls', () => {
		expect(component.formModel?.formGroup().get(fromHourControl)).not.toBe(
			null,
		);
		expect(component.formModel?.formGroup().get(toHourControl)).not.toBe(
			null,
		);
	});

	it('should form has default values on form', () => {
		expect(
			component.formModel?.formGroup().get(fromHourControl)?.value,
		).toBe(null);
		expect(component.formModel?.formGroup().get(toHourControl)?.value).toBe(
			null,
		);
	});

	it('should control from hour contains error if the value is incorrect', () => {
		component.formModel
			?.formGroup()
			.get(fromHourControl)
			?.setValue('25:00');
		expect(
			component.formModel?.formGroup().get(fromHourControl)?.errors,
		).not.toBe(null);
	});

	it('should control to hour contains error if the value is incorrect', () => {
		component.formModel?.formGroup().get(toHourControl)?.setValue('25:00');
		expect(
			component.formModel?.formGroup().get(toHourControl)?.errors,
		).not.toBe(null);
	});

	it('should control from hour contains error if the to hour control is before from hour', fakeAsync(() => {
		component.formModel
			?.formGroup()
			.get(fromHourControl)
			?.setValue('21:00');
		component.formModel?.formGroup().get(toHourControl)?.setValue('19:00');

		tick(1000);

		expect(
			component.formModel?.formGroup().get(fromHourControl)?.errors,
		).not.toBe(null);
	}));

	it('should set from hour time as current time if user click arrow up on keyboard', () => {
		const event = new KeyboardEvent('keydown', { code: 'ArrowUp' });

		keyboardEventServiceSpy.isInputFocused.and.returnValue(true);
		keyboardEventServiceSpy.isArrowUpEvent.and.returnValue(true);

		component.changeTimeOnFocusedTimeInputs(event, fromHourControl);

		fixture.detectChanges();

		const currentHour = moment().format(TIME_FORMAT);

		expect(
			component.formModel?.formGroup().get(fromHourControl)?.value,
		).toBe(currentHour);
	});

	it('should set to hour time as current time if user click arrow up on keyboard', () => {
		const event = new KeyboardEvent('keydown', { code: 'ArrowUp' });

		keyboardEventServiceSpy.isInputFocused.and.returnValue(true);
		keyboardEventServiceSpy.isArrowUpEvent.and.returnValue(true);

		component.changeTimeOnFocusedTimeInputs(event, toHourControl);

		fixture.detectChanges();

		const currentHour = moment().format(TIME_FORMAT);

		expect(component.formModel?.formGroup().get(toHourControl)?.value).toBe(
			currentHour,
		);
	});

	it('should set from hour time as current time if user click arrow down on keyboard', () => {
		const event = new KeyboardEvent('keydown', { code: 'ArrowDown' });

		keyboardEventServiceSpy.isInputFocused.and.returnValue(true);
		keyboardEventServiceSpy.isArrowDownEvent.and.returnValue(true);

		component.changeTimeOnFocusedTimeInputs(event, fromHourControl);

		fixture.detectChanges();

		const currentHour = moment().format(TIME_FORMAT);

		expect(
			component.formModel?.formGroup().get(fromHourControl)?.value,
		).toBe(currentHour);
	});

	it('should set to hour time as current time if user click arrow down on keyboard', () => {
		const event = new KeyboardEvent('keydown', { code: 'ArrowDown' });

		keyboardEventServiceSpy.isInputFocused.and.returnValue(true);
		keyboardEventServiceSpy.isArrowDownEvent.and.returnValue(true);

		component.changeTimeOnFocusedTimeInputs(event, toHourControl);

		fixture.detectChanges();

		const currentHour = moment().format(TIME_FORMAT);

		expect(component.formModel?.formGroup().get(toHourControl)?.value).toBe(
			currentHour,
		);
	});

	it('should increase from hour if user from hour is already set and user clicked arrow up', () => {
		const event = new KeyboardEvent('keydown', { code: 'ArrowUp' });

		component.formModel
			?.formGroup()
			.get(fromHourControl)
			?.setValue('12:00');

		keyboardEventServiceSpy.isInputFocused.and.returnValue(true);
		keyboardEventServiceSpy.isArrowUpEvent.and.returnValue(true);

		component.changeTimeOnFocusedTimeInputs(event, fromHourControl);
		fixture.detectChanges();

		expect(
			component.formModel?.formGroup().get(fromHourControl)?.value,
		).toBe('12:01');
	});

	it('should decrease from hour if user from hour is already set and user clicked arrow down', () => {
		const event = new KeyboardEvent('keydown', { code: 'ArrowDown' });

		component.formModel
			?.formGroup()
			.get(fromHourControl)
			?.setValue('12:00');

		keyboardEventServiceSpy.isInputFocused.and.returnValue(true);
		keyboardEventServiceSpy.isArrowDownEvent.and.returnValue(true);

		component.changeTimeOnFocusedTimeInputs(event, fromHourControl);
		fixture.detectChanges();

		expect(
			component.formModel?.formGroup().get(fromHourControl)?.value,
		).toBe('11:59');
	});

	it('should increase from hour if user click arrow up icon', () => {
		component.formModel
			?.formGroup()
			.get(fromHourControl)
			?.setValue('12:00');

		const arrowUpIcon = el.query(
			By.css('.calendar-time-ranger__time-picker-input mat-icon'),
		);

		arrowUpIcon.nativeElement.click();
		fixture.detectChanges();

		expect(
			component.formModel?.formGroup().get(fromHourControl)?.value,
		).toBe('12:01');
	});

	it('should decrease from hour if user click arrow down icon', () => {
		component.formModel
			?.formGroup()
			.get(fromHourControl)
			?.setValue('12:00');

		const arrowDownIcon = el.queryAll(
			By.css('.calendar-time-ranger__time-picker-input mat-icon'),
		);

		arrowDownIcon[1].nativeElement.click();
		fixture.detectChanges();

		expect(
			component.formModel?.formGroup().get(fromHourControl)?.value,
		).toBe('11:59');
	});

	it('should increase to hour if user click arrow up icon', () => {
		component.formModel?.formGroup().get(toHourControl)?.setValue('12:00');

		const arrowUpIcon = el.queryAll(
			By.css('.calendar-time-ranger__time-picker-input mat-icon'),
		);

		arrowUpIcon[2].nativeElement.click();
		fixture.detectChanges();

		expect(component.formModel?.formGroup().get(toHourControl)?.value).toBe(
			'12:01',
		);
	});

	it('should decrease to hour if user click arrow down icon', () => {
		component.formModel?.formGroup().get(toHourControl)?.setValue('12:00');

		const arrowDownIcon = el.queryAll(
			By.css('.calendar-time-ranger__time-picker-input mat-icon'),
		);

		arrowDownIcon[3].nativeElement.click();
		fixture.detectChanges();

		expect(component.formModel?.formGroup().get(toHourControl)?.value).toBe(
			'11:59',
		);
	});
});
