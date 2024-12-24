import { NgClass } from '@angular/common';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { DUTIES_MOCK, MOCK_PLANNERS } from 'src/mocks/mock-data';
import PlannerBoardDaysHeadersComponent from './planner-board-days-headers/planner-board-days-headers.component';
import PlannerBoardTileDutiesComponent from './planner-board-tile-duties/planner-board-tile-duties.component';
import PlannerBoardComponent from './planner-board.component';
import { ActivatedRoute } from '@angular/router';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';

describe('PlannerBoardComponent', () => {
	let component: PlannerBoardComponent;
	let fixture: ComponentFixture<PlannerBoardComponent>;
	let routerHelperServiceSpy: jasmine.SpyObj<RouterHelperService>;
	let el: DebugElement;

	beforeEach(waitForAsync(() => {
		routerHelperServiceSpy = jasmine.createSpyObj('RouterHelperService', [
			'getParameterValue',
		]);
		routerHelperServiceSpy.getParameterValue.and.returnValue(
			'f9fdeba5-4111-4744-89f6-5c33da51b8bf',
		);
		
		TestBed.configureTestingModule({
			imports: [
				NgClass,
				PlannerBoardComponent,
				MockComponent(PlannerBoardTileDutiesComponent),
				MockComponent(PlannerBoardDaysHeadersComponent),
				TranslateModule.forRoot(),
			],
			providers: [
				{
					provide: RouterHelperService,
					useValue: routerHelperServiceSpy,
				},
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: {
							paramMap: {
								get(): string {
									return 'f9fdeba5-4111-4744-89f6-5c33da51b8bf';
								},
							},
						},
					},
				},
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(PlannerBoardComponent);
				el = fixture.debugElement;
				component = fixture.componentInstance;
				fixture.componentRef.setInput('dailyBoardDuties', DUTIES_MOCK);
				fixture.componentRef.setInput('plannerDetails', MOCK_PLANNERS[2]);
				fixture.componentRef.setInput('isDynamic', false);
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
