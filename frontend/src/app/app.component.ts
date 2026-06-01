import {
	Component,
	DestroyRef,
	Injector,
	NgZone,
	OnInit,
	Renderer2,
	effect,
	inject,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DARK_MODE_CLASS } from '@core/app.consts';
import { AuthService } from '@core/auth/auth.service';
import { configEffect } from '@core/helpers/signal-effects.helper';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DarkModeService } from './core/services/dark-mode/dark-mode.service';
import SideMenuComponent from './shared/components/side-menu/side-menu.component';
import { DateHelperService } from './shared/services/locale-date/date-helper.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, TranslateModule, SideMenuComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export default class AppComponent implements OnInit {
	private readonly _ngZone: NgZone = inject(NgZone);
	private readonly _destroyRef: DestroyRef = inject(DestroyRef);
	private readonly _darkModeService: DarkModeService =
		inject(DarkModeService);
	private readonly ts: TranslateService = inject(TranslateService);
	private readonly _dateHelperService: DateHelperService =
		inject(DateHelperService);
	private readonly _injector: Injector = inject(Injector);
	private readonly _r2: Renderer2 = inject(Renderer2);
	private readonly _authService: AuthService = inject(AuthService);
	private readonly _router: Router = inject(Router);

	ngOnInit(): void {
		this.ts.use(this.ts.defaultLang);
		this._applyStyleMode();
		this._dateHelperService.changeLocalDateBasedOnLanguageChange();
	}

	public shouldShowAppMenu(): boolean {
		return (
			this._authService.isAuthenticated() &&
			!this._router.url.startsWith('/auth')
		);
	}

	private _applyStyleMode(): void {
		effect(() => {
			const darkModeState = this._darkModeService.darkMode();
			const { body } = document;

			if (darkModeState) {
				this._r2.addClass(body, DARK_MODE_CLASS);
			} else {
				this._r2.removeClass(body, DARK_MODE_CLASS);
			}
		}, configEffect(this._injector));
	}
}
