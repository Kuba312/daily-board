import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ACTIVATED_ROUTE_PROVIDER, ROUTER_MOCK } from '@core/helpers/tests-functions.helper';
import { TranslateModule } from '@ngx-translate/core';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import SideMenuComponent from './side-menu.component';

describe('SideMenuComponent', () => {
	let fixture: ComponentFixture<SideMenuComponent>;
	let component: SideMenuComponent;
	let el: DebugElement;
	let routerHelperServiceSpy: jasmine.SpyObj<RouterHelperService>;

	beforeEach(waitForAsync(() => {
		routerHelperServiceSpy = jasmine.createSpyObj('RouterHelperService', [
			'isActive',
		]);

		TestBed.configureTestingModule({
			imports: [
				SideMenuComponent,
				RouterModule,
				MatIconModule,
				TranslateModule.forRoot(),
			],
			providers: [
				{
					provide: Router,
					useValue: ROUTER_MOCK,
				},
				{
					provide: RouterHelperService,
					useValue: routerHelperServiceSpy,
				},
				{
					provide: ActivatedRoute,
					useValue: ACTIVATED_ROUTE_PROVIDER,
				},
			],
		})
			.compileComponents()
			.then(() => {
				TestBed.runInInjectionContext(() => {
					fixture = TestBed.createComponent(SideMenuComponent);
					el = fixture.debugElement;
					component = fixture.componentInstance;
					fixture.detectChanges();
				});
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should highlight item on nav menu when user direct to proper page', () => {
		routerHelperServiceSpy.isActive.withArgs('/planners').and.returnValue(true);
		routerHelperServiceSpy.isActive.withArgs('/calendar').and.returnValue(false);
		routerHelperServiceSpy.isActive.withArgs('/tasks').and.returnValue(false);
		routerHelperServiceSpy.isActive.withArgs('/settings').and.returnValue(false);
		fixture.detectChanges();
	
		const plannerActiveLink = el.query(By.css('.active-link span'));
		
		expect(plannerActiveLink.nativeElement.textContent).toBe('side-menu.planners')
	});
});
