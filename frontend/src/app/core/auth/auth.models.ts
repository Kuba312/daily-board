export interface AuthRequest {
	email: string;
	password: string;
}

export interface AuthUser {
	id: string;
	email: string;
}

export interface AuthResponse {
	token: string;
	user: AuthUser;
}

export type AuthMode = 'login' | 'register';
