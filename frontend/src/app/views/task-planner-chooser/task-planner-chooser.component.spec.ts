import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import HeaderWithButtonsComponent from '@shared/components/header-with-buttons/header-with-buttons.component';
import PlannerCardComponent from '@shared/components/planner-card/planner-card.component';
import PlannerItemsContainerComponent 
	from '@shared/components/planner-items-container/planner-items-container.component';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { MockComponent } from 'ng-mocks';
import { PlannerDto } from 'src/api/models';
import { MOCK_PLANNERS } from 'src/mocks/mock-data';
import TaskPlannerChooserComponent from './task-planner-chooser.component';

describe('TaskPlannerChooserComponent', () => {
	let fixture: ComponentFixture<TaskPlannerChooserComponent>;
	let component: TaskPlannerChooserComponent;
	let mockStore: jasmine.SpyObj<Store>;
	let routerHelperServiceSpy: jasmine.SpyObj<RouterHelperService>;
	let el: DebugElement;
	let planners: PlannerDto[];

	beforeEach(waitForAsync(() => {
		mockStore = jasmine.createSpyObj('Store', ['selectSignal']);
		routerHelperServiceSpy = jasmine.createSpyObj('RouterHelperService', [
			'directToUrl',
		]);

		planners = MOCK_PLANNERS;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mockStore.selectSignal.and.callFake((): any => {
			return () => planners;
		});

		TestBed.configureTestingModule({
			imports: [
				TranslateModule.forRoot(),
				NoopAnimationsModule,
				MockComponent(PlannerItemsContainerComponent),
				MockComponent(PlannerCardComponent),
				MockComponent(HeaderWithButtonsComponent),
			],
			providers: [
				{
					provide: RouterHelperService,
					useValue: routerHelperServiceSpy,
				},
				{ provide: Store, useValue: mockStore },
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(TaskPlannerChooserComponent);
				component = fixture.componentInstance;
				el = fixture.debugElement;
				component.HEADER_BUTTONS = [
					{
						buttonLabel: 'task-planner-chooser.assign-task',
						emitOnClick: true,
						width: 25,
						disabled: () => component.disabledButton(),
						callback: () => component.moveToCreateTaskPage(),
					},
				];

				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should render header with buttons component', () => {
		const headerWithButtonsComponent = el.query(
			By.directive(HeaderWithButtonsComponent),
		);

		expect(headerWithButtonsComponent).toBeTruthy();
	});

	it('should render planner items container', fakeAsync(async () => {
		const plannerItemsContainerComponent = el.query(
			By.directive(PlannerItemsContainerComponent),
		);

		expect(plannerItemsContainerComponent).toBeTruthy();
	}));

	it('should render planner cards', () => {
		fixture.detectChanges();

		const plannerCards = el.query(
			By.css('.task-planner-chooser .planner-items-container__cards'),
		).children;

		expect(plannerCards.length).toBe(3);
	});

	it('should select planner card', () => {
		component.selectPlannerCard(MOCK_PLANNERS[0]);
		fixture.detectChanges();

		expect(component.selectedPlannerCard()).toBe(MOCK_PLANNERS[0]);
	});

	it('should direct to duty creation page if user select and planner card and click create duty', () => {
		component.selectPlannerCard(MOCK_PLANNERS[0]);
		fixture.detectChanges();

		component.moveToCreateTaskPage();
		fixture.detectChanges();

		expect(routerHelperServiceSpy.directToUrl).toHaveBeenCalledWith(
			'/task-board-add',
			['21a67b1e-935a-4f38-bd14-8f35b205ba78'],
		);
	});

	it('should show info dialog if user has no added planners', () => {
		planners = [];
	
		fixture.detectChanges();
	
		const noPlannersInfo = el.query(
			By.css('.task-planner-chooser__no-planners'),
		);
	
		expect(noPlannersInfo).toBeTruthy();
	});
});
