import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import PlannerBoardDaysHeadersComponent from './planner-board-days-headers.component';
import { DebugElement } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DayShortcutResponsivePipe } from '@shared/pipes/day-shortcuts.pipe';
import { WEEKDAYS_MOCK } from 'src/mocks/mock-data';
import { By } from '@angular/platform-browser';
import { DateHelperService } from '@shared/services/locale-date/date-helper.service';

describe('PlannerBoardDaysHeadersComponent', () => {
	let fixture: ComponentFixture<PlannerBoardDaysHeadersComponent>;
	let component: PlannerBoardDaysHeadersComponent;
	let dateServiceSpy: jasmine.SpyObj<DateHelperService>;
	let el: DebugElement;

	beforeEach(waitForAsync(() => {
		dateServiceSpy = jasmine.createSpyObj('RouterHelperService', [
			'changeWeekPeriod',
			'currentWeekRange',
		]);

		TestBed.configureTestingModule({
			imports: [
				PlannerBoardDaysHeadersComponent,
				TranslateModule.forRoot(),
				DayShortcutResponsivePipe,
			],
			providers: [
				{
					provide: DateHelperService,
					useValue: dateServiceSpy,
				},
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(
					PlannerBoardDaysHeadersComponent,
				);
				component = fixture.componentInstance;
				el = fixture.debugElement;
				fixture.componentRef.setInput('keysTileBoard', WEEKDAYS_MOCK);
				fixture.componentRef.setInput('isDynamic', true);
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should show full name of week', () => {
		component.currentInnerWidth.set(1800);
		fixture.detectChanges();

		const dayContainerElement = el.queryAll(
			By.css('.planner-board-days-headers__day-container span'),
		);

		expect(dayContainerElement[0].nativeElement.innerText).toBe(
			'planner.full-days-names.monday',
		);
	});

	it('should show short name of week when screen is smaller', () => {
		component.currentInnerWidth.set(1300);
		fixture.detectChanges();

		const dayContainerElement = el.queryAll(
			By.css('.planner-board-days-headers__day-container span'),
		);

		expect(dayContainerElement[0].nativeElement.innerText).toBe(
			'planner.short-days-names.monday',
		);
	});

	it('should have proper initial width', () => {
		const initialWidth = window.innerWidth;

		expect(component.currentInnerWidth()).toBe(initialWidth);
	});

	it('should update currentInnerWidth on window resize', () => {
		const initialWidth = window.innerWidth;

		expect(component.currentInnerWidth()).toBe(initialWidth);

		const updatedWidth = initialWidth - 300;

		Object.defineProperty(window, 'innerWidth', {
			configurable: true,
			value: updatedWidth,
		});

		window.dispatchEvent(new Event('resize'));

		expect(component.currentInnerWidth()).toBe(updatedWidth);

		Object.defineProperty(window, 'innerWidth', {
			configurable: true,
			value: initialWidth,
		});
	});

	it('should emit changed week period', () => {
		const emitSpy = spyOn(component.changedWeekPeriod, 'emit');

		component.onWeekPeriodChanged(true);

		expect(emitSpy).toHaveBeenCalled();
	});

	it('should update week period', () => {
		const initialWeekIndex = component.currentWeekIndex();

		component.onWeekPeriodChanged(true);

		expect(component.currentWeekIndex()).toBe(initialWeekIndex - 1);
	});

	it('should emit proper week period', () => {
		const emitSpy = spyOn(component.changedWeekPeriod, 'emit');

		dateServiceSpy.currentWeekRange.and.returnValue({
			startOfWeek: '2024-12-22T23:00:00.000Z',
			endOfWeek: '2024-12-29T23:00:00.000Z',
		});
		dateServiceSpy.changeWeekPeriod.and.returnValue([
			'2024-12-16',
			'2024-12-22',
		]);

		component.onWeekPeriodChanged(true);

		expect(emitSpy).toHaveBeenCalledWith({
			weekPeriod: ['2024-12-16', '2024-12-22'],
			currentWeekIndex: component.currentWeekIndex(),
		});
	});

	afterEach(() => {
		fixture.destroy();
	});
});
