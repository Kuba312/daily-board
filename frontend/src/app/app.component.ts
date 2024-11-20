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
import { RouterOutlet } from '@angular/router';
import { DARK_MODE_CLASS } from '@core/app.consts';
import { configEffect } from '@core/helpers/signal-effects.helper';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DarkModeService } from './core/services/dark-mode/dark-mode.service';
import SideMenuComponent from './shared/components/side-menu/side-menu.component';
import { LocaleDateService } from './shared/services/locale-date/locale-date.service';

@Component({
	selector: 'app-root',
	standalone: true,
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
	private readonly _localeDateService: LocaleDateService =
		inject(LocaleDateService);
	private readonly _injector: Injector = inject(Injector);
	private readonly _r2: Renderer2 = inject(Renderer2);

	ngOnInit(): void {
		this.ts.use(this.ts.defaultLang);
		this._applyStyleMode();
		this._localeDateService.changeLocalDateBasedOnLanguageChange();
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
