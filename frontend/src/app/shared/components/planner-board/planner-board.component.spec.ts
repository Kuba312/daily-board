import { NgClass } from '@angular/common';
import { DebugElement, signal } from '@angular/core';
import {
	ComponentFixture,
	discardPeriodicTasks,
	fakeAsync,
	TestBed,
	tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DateHelperService } from '@shared/services/locale-date/date-helper.service';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { MockComponent } from 'ng-mocks';
import { DUTIES_MOCK, MOCK_HTML_ELEMENTS, MOCK_PLANNERS } from 'src/mocks/mock-data';
import PlannerBoardDaysHeadersComponent from './planner-board-days-headers/planner-board-days-headers.component';
import PlannerBoardTileDutiesComponent from './planner-board-tile-duties/planner-board-tile-duties.component';
import PlannerBoardComponent from './planner-board.component';

describe('PlannerBoardComponent', () => {
	let component: PlannerBoardComponent;
	let fixture: ComponentFixture<PlannerBoardComponent>;
	let routerHelperServiceSpy: jasmine.SpyObj<RouterHelperService>;
	let dateHelperServiceSpy: jasmine.SpyObj<DateHelperService>;
	let el: DebugElement;

	beforeEach(fakeAsync(
		() => {
			dateHelperServiceSpy = jasmine.createSpyObj(
				'DateHelperService',
				['getCurrentHour'],
			)
			routerHelperServiceSpy = jasmine.createSpyObj(
				'RouterHelperService',
				['getParameterValue'],
			);
			routerHelperServiceSpy.getParameterValue.and.returnValue(
				'f9fdeba5-4111-4744-89f6-5c33da51b8bf',
			);

			dateHelperServiceSpy.getCurrentHour.and.returnValue('10:00');

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
						provide: DateHelperService,
						useValue: dateHelperServiceSpy,
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
					component.timelineValues = signal(MOCK_HTML_ELEMENTS);

					fixture.componentRef.setInput(
						'dailyBoardDuties',
						DUTIES_MOCK,
					);
					fixture.componentRef.setInput(
						'plannerDetails',
						MOCK_PLANNERS[2],
					);
					discardPeriodicTasks();

					fixture.componentRef.setInput('isDynamic', false);
					fixture.detectChanges();
				});
		},
		{ flush: true },
	));

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

	it('should define slider details', fakeAsync(() => {
		tick(1000);
		fixture.detectChanges();

		const sliderDetails = component.timelineSliderDetails();
	
		expect(sliderDetails).toBeDefined();
	}));

	it('should define slider details', fakeAsync(() => {
		tick(1000);
		fixture.detectChanges();

		const sliderDetails = component.timelineSliderDetails();
	
		expect(sliderDetails).toEqual(jasmine.objectContaining({
			currentTime: "10:00",
			timeTopPosition: 35.75,
		}))
	}));

	it('should trigger recalculations of slider details if window is resized', fakeAsync(() =>{
		const initialWidth = window.innerWidth;

		Object.defineProperty(window, 'innerWidth', {
			configurable: true,
			value: 1024,
		});

		window.dispatchEvent(new Event('resize'));

		tick(500);

		Object.defineProperty(window, 'innerWidth', {
			configurable: true,
			value: 800,
		});

		window.dispatchEvent(new Event('resize'));

		tick(200);
		fixture.detectChanges();
	
		expect(component.timelineSliderDetails()).toBeDefined();

		Object.defineProperty(window, 'innerWidth', {
			configurable: true,
			value: initialWidth,
		});
	}))
});
