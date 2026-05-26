import { Injectable, Signal, WritableSignal, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PersistenceService } from '@core/services/persistance/persistance.service';
import { AuthApiService } from './auth-api.service';
import { AuthRequest, AuthResponse, AuthUser } from './auth.models';

export const AUTH_STORAGE_KEY = 'daily-board-auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly _authApiService: AuthApiService = inject(AuthApiService);
	private readonly _persistenceService: PersistenceService =
		inject(PersistenceService);

	private readonly _authState: WritableSignal<AuthResponse | null> = signal<AuthResponse | null>(
		this._persistenceService.get<AuthResponse>(AUTH_STORAGE_KEY) ?? null,
	);

	public readonly authState: Signal<AuthResponse | null> =
		this._authState.asReadonly();

	public register(request: AuthRequest): Observable<AuthResponse> {
		return this._authApiService
			.register(request)
			.pipe(tap((response) => this._setAuthState(response)));
	}

	public login(request: AuthRequest): Observable<AuthResponse> {
		return this._authApiService
			.login(request)
			.pipe(tap((response) => this._setAuthState(response)));
	}

	public logout(): void {
		this._authState.set(null);
		this._persistenceService.remove(AUTH_STORAGE_KEY);
	}

	public getToken(): string | null {
		return this._authState()?.token ?? null;
	}

	public getUser(): AuthUser | null {
		return this._authState()?.user ?? null;
	}

	public isAuthenticated(): boolean {
		return !!this.getToken();
	}

	private _setAuthState(response: AuthResponse): void {
		this._authState.set(response);
		this._persistenceService.set(AUTH_STORAGE_KEY, response);
	}
}
