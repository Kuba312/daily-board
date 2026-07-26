import { NgClass } from '@angular/common';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import LocaleDatePipe from '@shared/pipes/locale-date.pipe';
import SafeValue from '@shared/pipes/safe-value.pipe';
import { DateHelperService } from '@shared/services/locale-date/date-helper.service';
import { TimeValueConnectorService } from '@shared/services/time-value-connector.service';
import { YEAR_MOTH_DAY_FORMAT } from '@shared/constants/shared-consts.const';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import CalendarWeeksRangerComponent from './calendar-weeks-ranger.component';
import { MOCK_CHUNKS_DAYS } from 'src/mocks/mock-data';

describe('CalendarWeeksRangerComponent', () => {
	let fixture: ComponentFixture<CalendarWeeksRangerComponent>;
	let component: CalendarWeeksRangerComponent;
	let localeDateServiceSpy: jasmine.SpyObj<DateHelperService>;
	let timeValueConnectorServiceSpy: jasmine.SpyObj<TimeValueConnectorService>;
	let el: DebugElement;

	const currentDay = moment().toISOString();

	beforeEach(waitForAsync(() => {
		localeDateServiceSpy = jasmine.createSpyObj('LocaleDateService', [
			'getCurrentDay',
			'stringToDate',
			'getMonthsDaysChunksByDate',
			'dateToString',
			'localeDateFormat',
			'extractDayFromDate',
		]);
		timeValueConnectorServiceSpy = jasmine.createSpyObj(
			'TimeValueConnectorService',
			[
				'timeValueFrom',
				'timeValueTo',
				'changeTimeFromValue',
				'changeTimeToValue',
			],
		);

		TestBed.configureTestingModule({
			imports: [
				CalendarWeeksRangerComponent,
				FormsModule,
				MatInputModule,
				MatFormFieldModule,
				ReactiveFormsModule,
				MatInputModule,
				MatFormFieldModule,
				NgxMaskDirective,
				NoopAnimationsModule,
				TranslateModule.forRoot(),
				LocaleDatePipe,
				SafeValue,
				NgClass,
			],
			providers: [
				{ provide: DateHelperService, useValue: localeDateServiceSpy },
				{
					provide: TimeValueConnectorService,
					useValue: timeValueConnectorServiceSpy,
				},
				provideNgxMask(),
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(CalendarWeeksRangerComponent);
				component = fixture.componentInstance;
				el = fixture.debugElement;
				localeDateServiceSpy.getCurrentDay.and.returnValue(currentDay);
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should return current date', () => {
		component.currentMonth.set(localeDateServiceSpy.getCurrentDay());

		expect(component.currentMonth()).toEqual(currentDay);
	});

	it('should return extracted day if current month is not null and user does not provided value', () => {
		const formattedDate = moment(currentDay).format(YEAR_MOTH_DAY_FORMAT);
		const splittedDate = formattedDate.split('-');

		localeDateServiceSpy.extractDayFromDate.and.returnValue(
			splittedDate[2],
		);
		component.currentMonth.set(currentDay);

		expect(component.selectedDay()).toBe(splittedDate[2]);
	});

	it('should return extracted day if user provided value', () => {
		localeDateServiceSpy.extractDayFromDate.and.returnValue('12');
		fixture.componentRef.setInput('inputDate', '12-05-2023');
		fixture.detectChanges();

		expect(component.selectedDay()).toBe('12');
	});

	it('should set current month as custom if user provided a value', () => {
		fixture.componentRef.setInput('inputDate', '12-05-2024');
		localeDateServiceSpy.dateToString.and.returnValue(
			'2024-05-11T22:00:00.000Z',
		);

		component.ngOnInit();
		fixture.detectChanges();

		expect(component.currentMonth()).toBe('2024-05-11T22:00:00.000Z');
		expect(component.selectedMonth()).toBe('2024-05-11T22:00:00.000Z');
	});

	it('should select a next month when user click right arrow', () => {
		const currentMonth = moment().toISOString();
		const nextMonth = moment(currentMonth).add(1, 'month').toISOString();

		component.currentMonth.set(currentMonth);
		component.nextMonth();
		fixture.detectChanges();

		expect(component.currentMonth()).toBe(nextMonth);
	});

	it('should select a previous month when user click left arrow', () => {
		const currentMonth = moment().toISOString();
		const previousMonth = moment(currentMonth)
			.subtract(1, 'month')
			.toISOString();

		component.currentMonth.set(currentMonth);
		component.previousMonth();
		fixture.detectChanges();

		expect(component.currentMonth()).toBe(previousMonth);
	});

	it('should render chunks days', () => {
		localeDateServiceSpy.getMonthsDaysChunksByDate.and.returnValue(
			MOCK_CHUNKS_DAYS,
		);
		component.ngOnInit();
		fixture.detectChanges();

		const daysChunks = el.queryAll(
			By.css('.calendar-weeks-ranger__days-month-chunk'),
		);

		expect(daysChunks.length).toBe(5);
	});

	it('should add active class if current month is match with day', () => {
		localeDateServiceSpy.getMonthsDaysChunksByDate.and.returnValue(
			MOCK_CHUNKS_DAYS,
		);
		component.userSelectedDate.set('2024-10-01');
		component.ngOnInit();
		fixture.detectChanges();

		const activeDay = el.query(By.css('.active-calendar-day'));

		expect(activeDay).toBeTruthy();
	});

	it('should emit correct values when closeCalendar is called', () => {
		const mockFromTime = '10:00';
		const mockToTime = '12:00';
		const mockSelectedDate = '2023-10-15';
		const mockDateFromCurrentMonth = '2023-10-01';

		timeValueConnectorServiceSpy.timeValueFrom.and.returnValue(
			mockFromTime,
		);
		timeValueConnectorServiceSpy.timeValueTo.and.returnValue(mockToTime);
		spyOn(component, 'userSelectedDate').and.returnValue(mockSelectedDate);
		localeDateServiceSpy.stringToDate.and.returnValue(
			mockDateFromCurrentMonth,
		);

		spyOn(component.onCloseCalendar, 'emit');

		component.closeCalendar();

		expect(component.onCloseCalendar.emit).toHaveBeenCalledWith({
			date: mockSelectedDate || mockDateFromCurrentMonth,
			from: mockFromTime,
			to: mockToTime,
		});
	});
});
