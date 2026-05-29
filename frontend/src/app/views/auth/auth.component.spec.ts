import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { of, throwError } from 'rxjs';
import AuthComponent from './auth.component';

describe('AuthComponent', () => {
	let component: AuthComponent;
	let fixture: ComponentFixture<AuthComponent>;
	let authServiceSpy: jasmine.SpyObj<AuthService>;
	let routerSpy: jasmine.SpyObj<Router>;
	let snackBarServiceSpy: jasmine.SpyObj<SnackBarService>;

	beforeEach(async () => {
		authServiceSpy = jasmine.createSpyObj('AuthService', [
			'login',
			'register',
		]);
		routerSpy = jasmine.createSpyObj('Router', ['navigate']);
		snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', [
			'onShowSnackBarError',
		]);

		await TestBed.configureTestingModule({
			imports: [AuthComponent],
			providers: [
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: Router, useValue: routerSpy },
				{ provide: SnackBarService, useValue: snackBarServiceSpy },
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
		expect(routerSpy.navigate).toHaveBeenCalledWith(['/planners']);
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
	});
});
