import { HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { PersistenceService } from '@core/services/persistance/persistance.service';
import { of } from 'rxjs';
import { ApiConfiguration } from 'src/api/api-configuration';
import { authInterceptor } from './auth.interceptor';
import { AuthResponse } from './auth.models';
import { AUTH_STORAGE_KEY } from './auth.service';

describe('authInterceptor', () => {
	let persistenceServiceSpy: jasmine.SpyObj<PersistenceService>;
	let apiConfiguration: ApiConfiguration;
	const authResponse: AuthResponse = {
		token: 'token-123',
		user: {
			id: 'user-1',
			email: 'user@example.com',
		},
	};

	beforeEach(() => {
		persistenceServiceSpy = jasmine.createSpyObj('PersistenceService', [
			'get',
		]);
		apiConfiguration = new ApiConfiguration();
		apiConfiguration.rootUrl = 'http://localhost:8080';

		TestBed.configureTestingModule({
			providers: [
				{ provide: PersistenceService, useValue: persistenceServiceSpy },
				{ provide: ApiConfiguration, useValue: apiConfiguration },
			],
		});
	});

	it('should attach bearer token to backend api requests', () => {
		persistenceServiceSpy.get.and.returnValue(authResponse);
		const request = new HttpRequest(
			'GET',
			'http://localhost:8080/api/v1/planners/all',
		);
		let handledRequest!: HttpRequest<unknown>;

		TestBed.runInInjectionContext(() => {
			authInterceptor(request, (nextRequest) => {
				handledRequest = nextRequest;

				return of(new HttpResponse());
			}).subscribe();
		});

		expect(handledRequest.headers.get('Authorization')).toBe(
			'Bearer token-123',
		);
		expect(persistenceServiceSpy.get).toHaveBeenCalledWith(
			AUTH_STORAGE_KEY,
		);
	});

	it('should skip asset requests', () => {
		persistenceServiceSpy.get.and.returnValue(authResponse);
		const request = new HttpRequest('GET', '/assets/app-config.json');
		let handledRequest!: HttpRequest<unknown>;

		TestBed.runInInjectionContext(() => {
			authInterceptor(request, (nextRequest) => {
				handledRequest = nextRequest;

				return of(new HttpResponse());
			}).subscribe();
		});

		expect(handledRequest.headers.has('Authorization')).toBeFalse();
		expect(persistenceServiceSpy.get).not.toHaveBeenCalled();
	});
});
