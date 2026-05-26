import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfiguration } from 'src/api/api-configuration';
import { AuthRequest, AuthResponse } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
	private readonly _httpClient: HttpClient = inject(HttpClient);
	private readonly _apiConfiguration: ApiConfiguration = inject(ApiConfiguration);

	public register(request: AuthRequest): Observable<AuthResponse> {
		return this._httpClient.post<AuthResponse>(
			`${this._apiConfiguration.rootUrl}/api/v1/auth/register`,
			request,
		);
	}

	public login(request: AuthRequest): Observable<AuthResponse> {
		return this._httpClient.post<AuthResponse>(
			`${this._apiConfiguration.rootUrl}/api/v1/auth/login`,
			request,
		);
	}
}
