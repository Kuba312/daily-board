import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import HeaderComponent from '@shared/components/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { DUTIES_MOCK } from 'src/mocks/mock-data';
import PlannerComponent from './planner.component';
import { Store } from '@ngrx/store';
import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { DutyHelperService } from '@shared/services/duty-helper/duty-helper.service';
import SafeValue from '@shared/pipes/safe-value.pipe';

describe('PlannerComponent', () => {
	let component: PlannerComponent;
	let fixture: ComponentFixture<PlannerComponent>;
	let mockStore: jasmine.SpyObj<Store>;
	let routerHelperServiceSpy: jasmine.SpyObj<RouterHelperService>;
	let dutyHelperServiceSpy: jasmine.SpyObj<DutyHelperService>;

	beforeEach(waitForAsync(() => {
		mockStore = jasmine.createSpyObj('Store', ['selectSignal']);
		routerHelperServiceSpy = jasmine.createSpyObj('RouterHelperService', [
			'getParameterValue',
		]);
		dutyHelperServiceSpy = jasmine.createSpyObj('DutyHelperService', [
			'groupDutiesByDays',
		]);

		routerHelperServiceSpy.getParameterValue.and.returnValue(
			'f9fdeba5-4111-4744-89f6-5c33da51b8bf',
		);
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
});
