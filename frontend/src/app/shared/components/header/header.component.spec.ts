import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import HeaderComponent from './header.component';
import { TranslateModule } from '@ngx-translate/core';
import { DateDisplayMode } from '@shared/enums/date-display-mode.enum';
import moment from 'moment';
import { AdditionalLabelPipe } from '@shared/pipes/additional-label.pipe';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';

describe('HeaderComponent', () => {
	let fixture: ComponentFixture<HeaderComponent>;
	let routerHelperServiceSpy: jasmine.SpyObj<RouterHelperService>;
	let component: HeaderComponent;

	beforeEach(waitForAsync(() => {
		routerHelperServiceSpy = jasmine.createSpyObj('RouterHelperService', [
			'directToUrl',
		]);

		TestBed.configureTestingModule({
			imports: [
				HeaderComponent,
				TranslateModule.forRoot(),
				MatIconModule,
				AdditionalLabelPipe,
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
									return '/choose-planner';
								},
							},
						},
					},
				},
			],
		})
			.compileComponents()
			.then(() => {
				TestBed.runInInjectionContext(() => {
					fixture = TestBed.createComponent(HeaderComponent);
					fixture.componentRef.setInput('label', 'Test');
					fixture.componentRef.setInput('backToUrl', '/choose-planner');
					component = fixture.componentInstance;
				});
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should set week range if there is weekly strategy', () => {
		const startOfWeek = moment().startOf('week').toISOString();
		const endOfWeek = moment().endOf('week').toISOString();

		fixture.componentRef.setInput(
			'dateDisplayMode',
			DateDisplayMode.Weekly,
		);

		component.ngOnInit();

		expect(component.properDateDisplayMode()).toEqual(
			jasmine.objectContaining({
				startOfWeek,
				endOfWeek,
			}),
		);
	});

	it('should set day range if there is current day strategy', () => {
		fixture.componentRef.setInput('dateDisplayMode', DateDisplayMode.Daily);

		component.ngOnInit();

		expect(component.properDateDisplayMode()).not.toBe(null);
	});

	it('should set null if there is a none strategy set', () => {
		component.ngOnInit();

		expect(component.properDateDisplayMode()).toEqual(null);
	});

	it('should back to prev page', () => {
		fixture.componentRef.setInput('backQueryParams', {
			from: '2026-06-22',
			to: '2026-06-28',
		});

		component.directToPreviousPage();
		fixture.detectChanges();

		expect(routerHelperServiceSpy.directToUrl).toHaveBeenCalledWith(
			'/choose-planner',
			undefined,
			false,
			{
				from: '2026-06-22',
				to: '2026-06-28',
			},
		);
	})
});
