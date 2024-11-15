import { DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import HeaderWithButtonsComponent from '@shared/components/header-with-buttons/header-with-buttons.component';
import PlannerCardComponent from '@shared/components/planner-card/planner-card.component';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import PlannerItemsContainerComponent 
	from '@shared/components/planner-items-container/planner-items-container.component';
import { MockComponent } from 'ng-mocks';
import { MOCK_PLANNERS } from 'src/mocks/mock-data';
import PlannersDashboardComponent from './planners-dashboard.component';
import { By } from '@angular/platform-browser';

describe('TaskPlannerChooserComponent', () => {
	let fixture: ComponentFixture<PlannersDashboardComponent>;
	let component: PlannersDashboardComponent;
	let mockStore: jasmine.SpyObj<Store>;
	let routerHelperServiceSpy: jasmine.SpyObj<RouterHelperService>;
	let el: DebugElement;

	beforeEach(waitForAsync(() => {
		mockStore = jasmine.createSpyObj('Store', ['selectSignal']);
		routerHelperServiceSpy = jasmine.createSpyObj('RouterHelperService', [
			'directToUrl',
		]);

		mockStore.selectSignal.and.returnValue(signal(MOCK_PLANNERS));

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
				fixture = TestBed.createComponent(PlannersDashboardComponent);
				component = fixture.componentInstance;
				el = fixture.debugElement;
				component.HEADER_BUTTONS = [
					{
						buttonLabel: 'side-menu.add-planner',
						emitOnClick: true,
						width: 25,
						callback: () => component.directToPlannerCreator(),
					},
				];
				component.PLANNER_CARD_BUTTONS = [
					{
						buttonLabel: 'global.edit',
						emitOnClick: true,
						width: 10,
					},
					{
						buttonLabel: 'global.delete',
						emitOnClick: true,
						width: 10,
					},
				];

				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	})

	it('should render header with buttons component', () => {
		const headerWithButtonsComponent = el.query(
			By.directive(HeaderWithButtonsComponent),
		);

		expect(headerWithButtonsComponent).toBeTruthy();
	});

	it('should render planner items container', () => {
		const plannerItemsContainerComponent = el.query(
			By.directive(PlannerItemsContainerComponent),
		);

		expect(plannerItemsContainerComponent).toBeTruthy();
	});

	it('should render planner cards', () => {
		fixture.detectChanges();

		const plannerCards = el.query(
			By.css('.planners-dashboard .planner-items-container__cards'),
		).children;
		
		expect(plannerCards.length).toBe(3);
	});

	it('should direct to planner creator view', () => {
		component.directToPlannerCreator();

		fixture.detectChanges();

		expect(routerHelperServiceSpy.directToUrl).toHaveBeenCalled();
	})

	it('should direct to planner details view', () => {
		component.directToPlannerDetailsView(MOCK_PLANNERS[2]);

		fixture.detectChanges();

		expect(routerHelperServiceSpy.directToUrl).toHaveBeenCalled();
	})
	
});
