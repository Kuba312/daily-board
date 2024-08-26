import { NgClass } from '@angular/common';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { DUTIES_MOCK } from 'src/mocks/mock-data';
import PlannerBoardDaysHeadersComponent from './planner-board-days-headers/planner-board-days-headers.component';
import PlannerBoardTileDutiesComponent from './planner-board-tile-duties/planner-board-tile-duties.component';
import PlannerBoardComponent from './planner-board.component';

describe('PlannerBoardComponent', () => {
	let component: PlannerBoardComponent;
	let fixture: ComponentFixture<PlannerBoardComponent>;
	let el: DebugElement;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				NgClass,
				PlannerBoardComponent,
				MockComponent(PlannerBoardTileDutiesComponent),
				MockComponent(PlannerBoardDaysHeadersComponent),
				TranslateModule.forRoot(),
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(PlannerBoardComponent);
				el = fixture.debugElement;
				component = fixture.componentInstance;
				fixture.componentRef.setInput('dailyBoardDuties', DUTIES_MOCK);
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should apply partial hour hidden into partial hour', () => {
		const hiddenPartialHourClass = 'hidden-partial-hour';
		const partialHourElement = el.queryAll(
			By.css('.planner-board__timeline-content--item'),
		);

		expect(partialHourElement[1].classes[hiddenPartialHourClass]).toBe(
			true,
		);
	});

	it('should show planner board days headers properly', () => {
		const plannerBoardDaysHeadersComponent = fixture.debugElement.query(
			By.directive(PlannerBoardDaysHeadersComponent),
		);

		expect(plannerBoardDaysHeadersComponent).toBeTruthy();
	});

	it('should show planner board content headers properly', () => {
		const plannerBoardTileDutiesComponent = fixture.debugElement.query(
			By.directive(PlannerBoardTileDutiesComponent),
		);

		expect(plannerBoardTileDutiesComponent).toBeTruthy();
	});
});
