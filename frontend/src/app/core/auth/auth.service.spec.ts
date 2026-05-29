import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PersistenceService } from '@core/services/persistance/persistance.service';
import { AuthApiService } from './auth-api.service';
import { AuthResponse } from './auth.models';
import { AuthService } from './auth.service';

describe('AuthService', () => {
	let service: AuthService;
	let authApiServiceSpy: jasmine.SpyObj<AuthApiService>;
	let persistenceServiceSpy: jasmine.SpyObj<PersistenceService>;

	const authResponse: AuthResponse = {
		token: 'token-123',
		user: {
			id: 'user-1',
			email: 'user@example.com',
		},
	};

	beforeEach(() => {
		authApiServiceSpy = jasmine.createSpyObj('AuthApiService', [
			'register',
			'login',
		]);
		persistenceServiceSpy = jasmine.createSpyObj('PersistenceService', [
			'get',
			'set',
			'remove',
		]);
		persistenceServiceSpy.get.and.returnValue(null);

		TestBed.configureTestingModule({
			providers: [
				AuthService,
				{ provide: AuthApiService, useValue: authApiServiceSpy },
				{ provide: PersistenceService, useValue: persistenceServiceSpy },
			],
		});

		service = TestBed.inject(AuthService);
	});

	it('should restore auth state from persistence', () => {
		TestBed.resetTestingModule();
		persistenceServiceSpy.get.and.returnValue(authResponse);
		TestBed.configureTestingModule({
			providers: [
				AuthService,
				{ provide: AuthApiService, useValue: authApiServiceSpy },
				{ provide: PersistenceService, useValue: persistenceServiceSpy },
			],
		});

		const restoredService = TestBed.inject(AuthService);

		expect(restoredService.getToken()).toBe(authResponse.token);
		expect(restoredService.getUser()).toEqual(authResponse.user);
	});

	it('should persist auth state after login', (done) => {
		authApiServiceSpy.login.and.returnValue(of(authResponse));

		service
			.login({
				email: 'user@example.com',
				password: 'secret',
			})
			.subscribe(() => {
				expect(service.getToken()).toBe(authResponse.token);
				expect(persistenceServiceSpy.set).toHaveBeenCalledWith(
					'daily-board-auth',
					authResponse,
				);
				done();
			});
	});

	it('should persist auth state after register', (done) => {
		authApiServiceSpy.register.and.returnValue(of(authResponse));

		service
			.register({
				email: 'user@example.com',
				password: 'secret',
			})
			.subscribe(() => {
				expect(service.isAuthenticated()).toBeTrue();
				expect(persistenceServiceSpy.set).toHaveBeenCalledWith(
					'daily-board-auth',
					authResponse,
				);
				done();
			});
	});

	it('should clear auth state on logout', () => {
		authApiServiceSpy.login.and.returnValue(of(authResponse));
		service
			.login({
				email: 'user@example.com',
				password: 'secret',
			})
			.subscribe();

		service.logout();

		expect(service.getToken()).toBeNull();
		expect(service.getUser()).toBeNull();
		expect(persistenceServiceSpy.remove).toHaveBeenCalledWith(
			'daily-board-auth',
		);
	});
});
