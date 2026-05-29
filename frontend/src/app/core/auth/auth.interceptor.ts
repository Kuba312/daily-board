import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { PersistenceService } from '@core/services/persistance/persistance.service';
import { ApiConfiguration } from 'src/api/api-configuration';
import { AuthResponse } from './auth.models';
import { AUTH_STORAGE_KEY } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
	if (request.url.startsWith('/assets/') || !request.url.startsWith('http')) {
		return next(request);
	}

	const apiConfiguration = inject(ApiConfiguration);
	const isApiRequest = request.url.startsWith(apiConfiguration.rootUrl);

	if (!isApiRequest) {
		return next(request);
	}

	const persistenceService = inject(PersistenceService);
	const token = persistenceService.get<AuthResponse>(AUTH_STORAGE_KEY)?.token;

	if (!token) {
		return next(request);
	}

	return next(
		request.clone({
			headers: request.headers.set('Authorization', `Bearer ${token}`),
		}),
	);
};
