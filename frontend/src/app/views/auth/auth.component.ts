import { Component, WritableSignal, inject, signal } from '@angular/core';
import {
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { AuthMode, AuthRequest } from '@core/auth/auth.models';
import { TranslateModule } from '@ngx-translate/core';
import { INVALID_FORM_TRANSLATE_KEY } from '@shared/constants/translation-keys.const';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { validateForm } from '@shared/utils/form.utils';

interface AuthForm {
	email: FormControl<string>;
	password: FormControl<string>;
}

@Component({
	selector: 'app-auth',
	imports: [ReactiveFormsModule, TranslateModule],
	templateUrl: './auth.component.html',
	styleUrl: './auth.component.scss',
})
export default class AuthComponent {
	private readonly _authService: AuthService = inject(AuthService);
	private readonly _router: Router = inject(Router);
	private readonly _snackBarService: SnackBarService = inject(SnackBarService);

	public readonly mode: WritableSignal<AuthMode> = signal('login');
	public readonly isSubmitting: WritableSignal<boolean> = signal(false);
	public readonly authErrorKey: WritableSignal<string | null> = signal(null);

	public readonly formGroup: FormGroup<AuthForm> = new FormGroup<AuthForm>({
		email: new FormControl('', {
			nonNullable: true,
			validators: [Validators.required, Validators.email],
		}),
		password: new FormControl('', {
			nonNullable: true,
			validators: [Validators.required],
		}),
	});

	public submit(): void {
		if (this.isSubmitting()) {
			return;
		}

		this.authErrorKey.set(null);
		validateForm(this.formGroup);

		if (this.formGroup.invalid) {
			this._snackBarService.onShowSnackBarError({
				message: INVALID_FORM_TRANSLATE_KEY,
			});

			return;
		}

		this.isSubmitting.set(true);

		const request: AuthRequest = this.formGroup.getRawValue();
		const authRequest$ =
			this.mode() === 'register'
				? this._authService.register(request)
				: this._authService.login(request);

		authRequest$.subscribe({
			next: () => {
				this.isSubmitting.set(false);
				this._router.navigate(['/planners']);
			},
			error: () => {
				this.isSubmitting.set(false);
				this.authErrorKey.set('auth.error');
				this._snackBarService.onShowSnackBarError({
					message: 'auth.error',
				});
			},
		});
	}

	public setMode(mode: AuthMode): void {
		if (this.isSubmitting()) {
			return;
		}

		this.mode.set(mode);
		this.authErrorKey.set(null);
	}

	public get isLoginMode(): boolean {
		return this.mode() === 'login';
	}

	public get submitLabelKey(): string {
		if (this.isSubmitting()) {
			return this.isLoginMode ? 'auth.login-loading' : 'auth.register-loading';
		}

		return this.isLoginMode ? 'auth.login' : 'auth.register';
	}
}
