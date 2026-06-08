import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { dutyActions } from '@shared-store/duty-store/duty.actions';
import { plannerActions } from '@shared-store/planner-store/planner.actions';
import { Subject, of, throwError } from 'rxjs';
import AuthComponent from './auth.component';

describe('AuthComponent', () => {
	let component: AuthComponent;
	let fixture: ComponentFixture<AuthComponent>;
	let authServiceSpy: jasmine.SpyObj<AuthService>;
	let routerSpy: jasmine.SpyObj<Router>;
	let snackBarServiceSpy: jasmine.SpyObj<SnackBarService>;
	let storeSpy: jasmine.SpyObj<Store>;

	beforeEach(async () => {
		authServiceSpy = jasmine.createSpyObj('AuthService', [
			'login',
			'register',
		]);
		routerSpy = jasmine.createSpyObj('Router', ['navigate']);
		snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', [
			'onShowSnackBarError',
		]);
		storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

		await TestBed.configureTestingModule({
			imports: [AuthComponent, TranslateModule.forRoot()],
			providers: [
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: Router, useValue: routerSpy },
				{ provide: SnackBarService, useValue: snackBarServiceSpy },
				{ provide: Store, useValue: storeSpy },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(AuthComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should login and navigate to planners', () => {
		authServiceSpy.login.and.returnValue(
			of({
				token: 'token',
				user: { id: 'user-1', email: 'user@example.com' },
			}),
		);
		component.formGroup.setValue({
			email: 'user@example.com',
			password: 'secret',
		});

		component.submit();

		expect(authServiceSpy.login).toHaveBeenCalledWith({
			email: 'user@example.com',
			password: 'secret',
		});
		expect(storeSpy.dispatch).toHaveBeenCalledWith(
			plannerActions.resetPlanners(),
		);
		expect(storeSpy.dispatch).toHaveBeenCalledWith(dutyActions.resetDuties());
		expect(routerSpy.navigate).toHaveBeenCalledWith(['/planners']);
		expect(storeSpy.dispatch).toHaveBeenCalledBefore(routerSpy.navigate);
	});

	it('should register when register mode is selected', () => {
		authServiceSpy.register.and.returnValue(
			of({
				token: 'token',
				user: { id: 'user-1', email: 'user@example.com' },
			}),
		);
		component.setMode('register');
		component.formGroup.setValue({
			email: 'user@example.com',
			password: 'secret',
		});

		component.submit();

		expect(authServiceSpy.register).toHaveBeenCalledWith({
			email: 'user@example.com',
			password: 'secret',
		});
		expect(storeSpy.dispatch).toHaveBeenCalledWith(
			plannerActions.resetPlanners(),
		);
		expect(storeSpy.dispatch).toHaveBeenCalledWith(dutyActions.resetDuties());
		expect(routerSpy.navigate).toHaveBeenCalledWith(['/planners']);
		expect(storeSpy.dispatch).toHaveBeenCalledBefore(routerSpy.navigate);
	});

	it('should show validation error when form is invalid', () => {
		component.submit();

		expect(snackBarServiceSpy.onShowSnackBarError).toHaveBeenCalled();
		expect(authServiceSpy.login).not.toHaveBeenCalled();
	});

	it('should show auth error when request fails', () => {
		authServiceSpy.login.and.returnValue(
			throwError(() => new Error('invalid credentials')),
		);
		component.formGroup.setValue({
			email: 'user@example.com',
			password: 'secret',
		});

		component.submit();

		expect(snackBarServiceSpy.onShowSnackBarError).toHaveBeenCalledWith({
			message: 'auth.error',
		});
		expect(component.authErrorKey()).toBe('auth.error');
		fixture.detectChanges();
		expect(
			fixture.nativeElement.querySelector('.auth__error').textContent,
		).toContain('auth.error');
	});

	it('should show auth error when register request fails', () => {
		authServiceSpy.register.and.returnValue(
			throwError(() => new Error('email already exists')),
		);
		component.setMode('register');
		component.formGroup.setValue({
			email: 'user@example.com',
			password: 'secret',
		});

		component.submit();

		expect(snackBarServiceSpy.onShowSnackBarError).toHaveBeenCalledWith({
			message: 'auth.error',
		});
		expect(component.authErrorKey()).toBe('auth.error');
	});

	it('should prevent duplicate submit while request is pending', () => {
		const loginRequest$ = new Subject<{
			token: string;
			user: { id: string; email: string };
		}>();
		authServiceSpy.login.and.returnValue(loginRequest$);
		component.formGroup.setValue({
			email: 'user@example.com',
			password: 'secret',
		});

		component.submit();
		component.submit();

		expect(authServiceSpy.login).toHaveBeenCalledTimes(1);
		expect(component.isSubmitting()).toBeTrue();
	});

	it('should disable mode buttons and show loading submit label during login', () => {
		const loginRequest$ = new Subject<{
			token: string;
			user: { id: string; email: string };
		}>();
		authServiceSpy.login.and.returnValue(loginRequest$);
		component.formGroup.setValue({
			email: 'user@example.com',
			password: 'secret',
		});

		component.submit();
		fixture.detectChanges();

		const modeButtons = fixture.nativeElement.querySelectorAll(
			'.auth__mode-button',
		) as NodeListOf<HTMLButtonElement>;
		const submitButton = fixture.nativeElement.querySelector(
			'.auth__submit',
		) as HTMLButtonElement;

		expect(modeButtons[0].disabled).toBeTrue();
		expect(modeButtons[1].disabled).toBeTrue();
		expect(submitButton.disabled).toBeTrue();
		expect(submitButton.textContent).toContain('auth.login-loading');
	});

	it('should show register loading label while register request is pending', () => {
		const registerRequest$ = new Subject<{
			token: string;
			user: { id: string; email: string };
		}>();
		authServiceSpy.register.and.returnValue(registerRequest$);
		component.setMode('register');
		component.formGroup.setValue({
			email: 'user@example.com',
			password: 'secret',
		});

		component.submit();
		fixture.detectChanges();

		const submitButton = fixture.nativeElement.querySelector(
			'.auth__submit',
		) as HTMLButtonElement;
		expect(submitButton.textContent).toContain('auth.register-loading');
	});

	it('should clear inline auth error when retrying submit', () => {
		const loginRequest$ = new Subject<{
			token: string;
			user: { id: string; email: string };
		}>();
		authServiceSpy.login.and.returnValues(
			throwError(() => new Error('invalid credentials')),
			loginRequest$,
		);
		component.formGroup.setValue({
			email: 'user@example.com',
			password: 'secret',
		});

		component.submit();
		expect(component.authErrorKey()).toBe('auth.error');

		component.submit();

		expect(component.authErrorKey()).toBeNull();
	});

	it('should clear inline auth error when switching mode', () => {
		authServiceSpy.login.and.returnValue(
			throwError(() => new Error('invalid credentials')),
		);
		component.formGroup.setValue({
			email: 'user@example.com',
			password: 'secret',
		});
		component.submit();

		component.setMode('register');

		expect(component.authErrorKey()).toBeNull();
		expect(component.mode()).toBe('register');
	});

	it('should not switch mode while submitting', () => {
		const loginRequest$ = new Subject<{
			token: string;
			user: { id: string; email: string };
		}>();
		authServiceSpy.login.and.returnValue(loginRequest$);
		component.formGroup.setValue({
			email: 'user@example.com',
			password: 'secret',
		});

		component.submit();
		component.setMode('register');

		expect(component.mode()).toBe('login');
	});
});
