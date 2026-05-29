import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
	let authServiceSpy: jasmine.SpyObj<AuthService>;
	let routerSpy: jasmine.SpyObj<Router>;

	beforeEach(() => {
		authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
		routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
		routerSpy.createUrlTree.and.returnValue({ redirected: true } as never);

		TestBed.configureTestingModule({
			providers: [
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: Router, useValue: routerSpy },
			],
		});
	});

	it('should allow authenticated users', () => {
		authServiceSpy.isAuthenticated.and.returnValue(true);

		const result = TestBed.runInInjectionContext(() =>
			authGuard({} as never, {} as never),
		);

		expect(result).toBeTrue();
	});

	it('should redirect unauthenticated users to auth route', () => {
		authServiceSpy.isAuthenticated.and.returnValue(false);

		const result = TestBed.runInInjectionContext(() =>
			authGuard({} as never, {} as never),
		);

		expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth']);
		expect(result).toEqual({ redirected: true } as never);
	});
});
