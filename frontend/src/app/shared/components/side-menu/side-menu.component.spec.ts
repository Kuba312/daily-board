import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ACTIVATED_ROUTE_PROVIDER, ROUTER_MOCK } from '@core/helpers/tests-functions.helper';
import { AuthService } from '@core/auth/auth.service';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { dutyActions } from '@shared-store/duty-store/duty.actions';
import { plannerActions } from '@shared-store/planner-store/planner.actions';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import SideMenuComponent from './side-menu.component';

describe('SideMenuComponent', () => {
	let fixture: ComponentFixture<SideMenuComponent>;
	let component: SideMenuComponent;
	let el: DebugElement;
	let routerHelperServiceSpy: jasmine.SpyObj<RouterHelperService>;
	let authServiceSpy: jasmine.SpyObj<AuthService>;
	let storeSpy: jasmine.SpyObj<Store>;

	beforeEach(waitForAsync(() => {
		routerHelperServiceSpy = jasmine.createSpyObj('RouterHelperService', [
			'isActive',
			'directToUrl',
		]);
		authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
		storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

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
					provide: AuthService,
					useValue: authServiceSpy,
				},
				{
					provide: Store,
					useValue: storeSpy,
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

	it('should clear stores and route to auth on logout', () => {
		component.logout();

		expect(storeSpy.dispatch).toHaveBeenCalledWith(
			plannerActions.resetPlanners(),
		);
		expect(storeSpy.dispatch).toHaveBeenCalledWith(dutyActions.resetDuties());
		expect(authServiceSpy.logout).toHaveBeenCalled();
		expect(routerHelperServiceSpy.directToUrl).toHaveBeenCalledWith('/auth');
	});
});
