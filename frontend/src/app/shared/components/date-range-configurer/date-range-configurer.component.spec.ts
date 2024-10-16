import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DateRangeConfigurerComponent } from './date-range-configurer.component';
import LocaleDatePipe from '@shared/pipes/locale-date.pipe';
import { DebugElement } from '@angular/core';
import { WEEK_RANGE_MOCK } from 'src/mocks/mock-data';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import SafeValue from '@shared/pipes/safe-value.pipe';

describe('DateRangeConfigurerComponent', () => {
	let fixture: ComponentFixture<DateRangeConfigurerComponent>;
	let component: DateRangeConfigurerComponent;
	let el: DebugElement;	

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				DateRangeConfigurerComponent,
				TranslateModule.forRoot(),
				LocaleDatePipe,
				SafeValue,
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(DateRangeConfigurerComponent);
				el = fixture.debugElement;
				component = fixture.componentInstance;
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display week range when week strategy is passed', () => {
		fixture.componentRef.setInput('properDateDisplayMode', WEEK_RANGE_MOCK);

		component.isStartOfWeek(WEEK_RANGE_MOCK);
		fixture.detectChanges();

		const weekRangeFirstDateElement = el.query(
			By.css('.week-range :first-child'),
		);
		const weekRangeSecondDateElement = el.query(
			By.css('.week-range :last-child'),
		);

		expect(weekRangeFirstDateElement.nativeElement.innerText).not.toBe(null);
		expect(weekRangeSecondDateElement.nativeElement.innerText).not.toBe(null);
	});

	it('should display day range when day strategy is passed', () => {
		const dayRange = '2024-07-21T22:00:00.000Z';

		fixture.componentRef.setInput('properDateDisplayMode', dayRange);

		component.isDayRange(dayRange);
		fixture.detectChanges();

		const currentDayElement = el.query(By.css('.day-range'));

		expect(currentDayElement.nativeElement.innerText).not.toBe(null);
	});

	it('should not display any date when none strategy is passed', () => {
		fixture.componentRef.setInput('properDateDisplayMode', null);

		const weekRangeElement = el.query(By.css('.week-range'));
		const currentDayElement = el.query(By.css('.day-range'));

		expect(weekRangeElement).toBeFalsy();
		expect(currentDayElement).toBeFalsy();

	});
});
