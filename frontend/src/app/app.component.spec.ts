import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import AppComponent from './app.component';
import { TranslateModule } from '@ngx-translate/core';
import { DateHelperService } from './shared/services/locale-date/date-helper.service';
import { DARK_MODE_CLASS } from './core/app.consts';
import { DarkModeService } from './core/services/dark-mode/dark-mode.service';
import { ActivatedRoute } from '@angular/router';
import { ACTIVATED_ROUTE_PROVIDER } from './core/helpers/tests-functions.helper';
import { AuthService } from './core/auth/auth.service';
import { Store } from '@ngrx/store';

describe('AppComponent', () => {
	let component: AppComponent;
	let fixture: ComponentFixture<AppComponent>;
	let localeDateService: DateHelperService;
	let localeDateServiceSpy: jasmine.SpyObj<DateHelperService>;
	let darkModeServiceSpy: jasmine.SpyObj<DarkModeService>;
	let authServiceSpy: jasmine.SpyObj<AuthService>;
	let storeSpy: jasmine.SpyObj<Store>;

	beforeEach(waitForAsync(() => {
		localeDateServiceSpy = jasmine.createSpyObj('LocaleDateService', [
			'changeLocalDateBasedOnLanguageChange',
		]);
		darkModeServiceSpy = jasmine.createSpyObj('DarkModeService', [
			'toggleDarkMode',
			'darkMode',
		]);
		authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
		storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

		TestBed.configureTestingModule({
			imports: [AppComponent, TranslateModule.forRoot()],
			providers: [
				{ provide: DarkModeService, useValue: darkModeServiceSpy },
				{ provide: DateHelperService, useValue: localeDateServiceSpy },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: Store, useValue: storeSpy },
				{
					provide: ActivatedRoute,
					useValue: ACTIVATED_ROUTE_PROVIDER,
				},
			],
		})
			.compileComponents()
			.then(() => {
				TestBed.runInInjectionContext(() => {
					fixture = TestBed.createComponent(AppComponent);
					localeDateService = TestBed.inject(DateHelperService);
					component = fixture.componentInstance;
				});
			});
	}));

	it('should create the app', () => {
		expect(component).toBeTruthy();
	});

	it('should call changeLocalDateBasedOnLanguageChange method during init of app', () => {
		component.ngOnInit();

		expect(
			localeDateService.changeLocalDateBasedOnLanguageChange,
		).toHaveBeenCalledTimes(1);
	});

	it('should initially set light mode on the whole app', () => {
		component.ngOnInit();
		fixture.detectChanges();

		const documentElement = document.querySelector('body');

		expect(documentElement?.classList.length).toEqual(0);
	});

	it('should set dark mode on the whole app', () => {
		darkModeServiceSpy.darkMode.and.returnValue(true);
		component.ngOnInit();
		fixture.detectChanges();

		const documentElement = document.querySelector('body');

		expect(documentElement?.classList.contains(DARK_MODE_CLASS)).toBe(true);
	});

	it('should remove dark mode when dark mode is disabled', () => {
		darkModeServiceSpy.darkMode.and.returnValue(false);
		component.ngOnInit();
		fixture.detectChanges();

		const documentElement = document.querySelector('body');

		expect(documentElement?.classList.contains(DARK_MODE_CLASS)).toBe(
			false,
		);
	});
});
