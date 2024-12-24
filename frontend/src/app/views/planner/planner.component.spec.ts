import { Signal, signal } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import HeaderComponent from '@shared/components/header/header.component';
import SafeValue from '@shared/pipes/safe-value.pipe';
import { DutyHelperService } from '@shared/services/duty-helper/duty-helper.service';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { MockComponent } from 'ng-mocks';
import { DUTIES_MOCK, PLANNER_DETAILS_MOCK } from 'src/mocks/mock-data';
import PlannerComponent from './planner.component';
import { isTimeRangePlannerLoaded } from '@shared-store/duty-store/duty.selectors';
import { PeriodWeek } from '@shared/models/period-week';
import { AnimationPlannerDirection } from '@shared/enums/animation-planner-direction.enum';

describe('PlannerComponent', () => {
	let component: PlannerComponent;
	let fixture: ComponentFixture<PlannerComponent>;
	let mockStore: jasmine.SpyObj<Store>;
	let routerHelperServiceSpy: jasmine.SpyObj<RouterHelperService>;
	let dutyHelperServiceSpy: jasmine.SpyObj<DutyHelperService>;

	const plannerId: string = 'f9fdeba5-4111-4744-89f6-5c33da51b8bf' as const;

	beforeEach(waitForAsync(() => {
		mockStore = jasmine.createSpyObj('Store', ['selectSignal', 'dispatch']);
		routerHelperServiceSpy = jasmine.createSpyObj('RouterHelperService', [
			'getParameterValue',
		]);
		dutyHelperServiceSpy = jasmine.createSpyObj('DutyHelperService', [
			'groupDutiesByDays',
		]);

		routerHelperServiceSpy.getParameterValue.and.returnValue(plannerId);
		dutyHelperServiceSpy.groupDutiesByDays.and.returnValue(new Map());
		mockStore.selectSignal.and.returnValue(signal([...DUTIES_MOCK]));

		TestBed.configureTestingModule({
			imports: [
				PlannerComponent,
				SafeValue,
				TranslateModule.forRoot(),
				MockComponent(HeaderComponent),
			],
			providers: [
				{ provide: Store, useValue: mockStore },
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
									return plannerId;
								},
							},
						},
					},
				},
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(PlannerComponent);
				component = fixture.componentInstance;
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should show planner board days headers properly', () => {
		const headerComponent = fixture.debugElement.query(
			By.directive(HeaderComponent),
		);

		expect(headerComponent).toBeTruthy();
	});

	it('should load planner data properly', () => {
		spyOn(component, 'plannerDetails').and.returnValue(null);
		spyOn(component, 'isPlannerLoaded').and.returnValue(false);

		fixture.detectChanges();

		component.ngOnInit();

		expect(mockStore.dispatch).toHaveBeenCalledWith(
			jasmine.objectContaining({
				type: '[planner] Get planner',
				id: plannerId,
			}),
		);
	});

	it('should not load planner data if planner is already loaded', () => {
		spyOn(component, 'plannerDetails').and.returnValue(
			PLANNER_DETAILS_MOCK,
		);
		spyOn(component, 'isPlannerLoaded').and.returnValue(true);

		fixture.detectChanges();

		component.ngOnInit();

		expect(mockStore.dispatch).not.toHaveBeenCalled();
	});

	it('should show planner board properly', () => {
		const plannerBoard = fixture.debugElement.query(
			By.css('app-planner-board'),
		);

		expect(plannerBoard).toBeTruthy();
	});

	it('should show planner board days properly', () => {
		const plannerBoard = fixture.debugElement.query(
			By.css('app-planner-board'),
		);

		expect(plannerBoard).toBeTruthy();
	});

	it('should not dispatch duties if range time planner is already loaded', () => {
		const mockPeriodWeek: PeriodWeek = {
			weekPeriod: ['2024-12-18', '2024-12-24'], // WeekBoundary type
			currentWeekIndex: 1,
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mockStore.selectSignal.and.callFake((selector: any): any => {
			if (
				selector ===
				isTimeRangePlannerLoaded(plannerId, '2024-12-18', '2024-12-24')
			) {
				return signal(false) as Signal<boolean>;
			}

			return signal([]) as Signal<never[]>;
		});

		component.onWeekPeriodChanged(mockPeriodWeek);

		expect(mockStore.dispatch).not.toHaveBeenCalled();
		expect(component.fromDate()).toEqual('2024-12-18');
		expect(component.toDate()).toEqual('2024-12-24');
	});

	it('should dispatch duties if range time planner is not loaded', () => {
		const mockPeriodWeek: PeriodWeek = {
			weekPeriod: ['2024-12-18', '2024-12-24'], // WeekBoundary type
			currentWeekIndex: 1,
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mockStore.selectSignal.and.callFake((selector: any): any => {
			if (
				selector ===
				isTimeRangePlannerLoaded(plannerId, '2024-12-18', '2024-12-24')
			) {
				return signal(true) as Signal<boolean>;
			}

			return signal(false) as Signal<boolean>;
		});

		component.onWeekPeriodChanged(mockPeriodWeek);

		expect(mockStore.dispatch).toHaveBeenCalledWith(
			jasmine.objectContaining({
				type: '[duty] Get duties by range time and planner id',
				plannerId,
				from: '2024-12-18',
				to: '2024-12-24',
			}),
		);
		expect(component.fromDate()).toEqual('2024-12-18');
		expect(component.toDate()).toEqual('2024-12-24');
	});

	it('should apply right slide planner animation', () => {
		const mockPeriodWeek: PeriodWeek = {
			weekPeriod: ['2024-12-18', '2024-12-24'],
			currentWeekIndex: 1,
		};

		component.onWeekPeriodChanged(mockPeriodWeek);
		
		expect(component.slidePlannerDirection()).toEqual(AnimationPlannerDirection.Right)

	});

	it('should apply left slide planner animation', () => {
		const mockPeriodWeek: PeriodWeek = {
			weekPeriod: ['2024-12-16', '2024-12-22'],
			currentWeekIndex: -1,
		};

		component.onWeekPeriodChanged(mockPeriodWeek);
		
		expect(component.slidePlannerDirection()).toEqual(AnimationPlannerDirection.Left)
	});

	it('should reset state of planner animation', () => {
		component.onPlannerAnimationEnd();

		expect(component.slidePlannerDirection()).toBeNull();
	});
	
});
