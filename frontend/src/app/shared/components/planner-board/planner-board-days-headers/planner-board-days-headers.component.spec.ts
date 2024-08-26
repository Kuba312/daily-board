import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import PlannerBoardDaysHeadersComponent from './planner-board-days-headers.component';
import { DebugElement } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DayShortcutResponsivePipe } from '@shared/pipes/day-shortcuts.pipe';
import { WEEKDAYS_MOCK } from 'src/mocks/mock-data';
import { By } from '@angular/platform-browser';

describe('PlannerBoardDaysHeadersComponent', () => {
	let fixture: ComponentFixture<PlannerBoardDaysHeadersComponent>;
	let component: PlannerBoardDaysHeadersComponent;
	let el: DebugElement;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				PlannerBoardDaysHeadersComponent,
				TranslateModule.forRoot(),
				DayShortcutResponsivePipe,
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
			By.css('.planner-board-days-headers__day-container'),
		);

		expect(dayContainerElement[0].nativeElement.innerText).toBe(
			'planner.full-days-names.monday',
		);
	});

	it('should show short name of week when screen is smaller', () => {
		component.currentInnerWidth.set(1300);
		fixture.detectChanges();

		const dayContainerElement = el.queryAll(
			By.css('.planner-board-days-headers__day-container'),
		);

		expect(dayContainerElement[0].nativeElement.innerText).toBe(
			'planner.short-days-names.monday',
		);
	})

	it('should have proper initial width', () => {
		const initialWidth = window.innerWidth;

		expect(component.currentInnerWidth()).toBe(initialWidth);
	})

	it('should update currentInnerWidth on window resize', () => {
		const initialWidth = window.innerWidth;

		expect(component.currentInnerWidth()).toBe(initialWidth);

		const updatedWidth = initialWidth - 300;

		spyOnProperty(window, 'innerWidth').and.returnValue(updatedWidth);

		window.dispatchEvent(new Event('resize'));

		expect(component.currentInnerWidth()).toBe(updatedWidth);
	})
});
