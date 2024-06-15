import {
	Component,
	Injector,
	OnInit,
	Renderer2,
	effect,
	inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DarkModeService } from '@core/services/dark-mode.service';
import { configEffect } from '@core/helpers/signal-effects.helper';
import { DARK_MODE_CLASS } from '@core/app.consts';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, TranslateModule],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export default class AppComponent implements OnInit {
	private readonly _darkModeService: DarkModeService =
		inject(DarkModeService);
	private readonly _injector: Injector = inject(Injector);
	private readonly _r2: Renderer2 = inject(Renderer2);

	ngOnInit(): void {
		this._applyStyleMode();
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
