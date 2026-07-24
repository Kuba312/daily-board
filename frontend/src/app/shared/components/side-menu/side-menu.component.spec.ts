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
		authServiceSpy = jasmine.createSpyObj('AuthService', [
			'logout',
			'isAuthenticated',
		]);
		authServiceSpy.isAuthenticated.and.returnValue(false);
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

	it('should show only working navigation items and highlight planners', () => {
		routerHelperServiceSpy.isActive.withArgs('/planners').and.returnValue(true);
		fixture.detectChanges();

		const navigationItems = el.queryAll(By.css('.side-menu__nav-links a'));
		const plannerActiveLink = el.query(By.css('.active-link span'));

		expect(navigationItems.length).toBe(1);
		expect(plannerActiveLink.nativeElement.textContent).toBe('side-menu.planners');
	});

	it('should hide authenticated actions when user is not authenticated', () => {
		authServiceSpy.isAuthenticated.and.returnValue(false);
		fixture.detectChanges();

		const actionButtons = el.queryAll(By.css('.side-menu__actions app-primary-button'));

		expect(actionButtons.length).toBe(0);
	});

	it('should show authenticated actions when user is authenticated', () => {
		authServiceSpy.isAuthenticated.and.returnValue(true);
		fixture.detectChanges();

		const actionButtons = el.queryAll(By.css('.side-menu__actions app-primary-button'));
		const actionLabels = actionButtons.map((button) =>
			button.nativeElement.textContent.trim(),
		);

		expect(actionLabels).toEqual([
			'side-menu.new-duty',
			'side-menu.add-planner',
			'side-menu.logout',
		]);
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
