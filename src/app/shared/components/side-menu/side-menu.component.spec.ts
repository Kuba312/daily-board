import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import SideMenuComponent from './side-menu.component';
import { DebugElement } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';

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
					useValue: {
						url: '/planner',
					},
				},
				{
					provide: RouterHelperService,
					useValue: routerHelperServiceSpy,
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
		routerHelperServiceSpy.isActive.withArgs('/planner').and.returnValue(true);
		routerHelperServiceSpy.isActive.withArgs('/calendar').and.returnValue(false);
		routerHelperServiceSpy.isActive.withArgs('/tasks').and.returnValue(false);
		routerHelperServiceSpy.isActive.withArgs('/settings').and.returnValue(false);
		fixture.detectChanges();
	
		const plannerActiveLink = el.query(By.css('.active-link span'));
		
		expect(plannerActiveLink.nativeElement.textContent).toBe('side-menu.planner')
	});
});
