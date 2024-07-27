import {
	Component,
	InputSignal,
	OnInit,
	WritableSignal,
	inject,
	input,
	signal,
} from '@angular/core';
import { LocaleDateService } from '@shared/services/locale-date.service';
import { TranslateModule } from '@ngx-translate/core';
import { DateDisplayMode } from '@shared/enums/date-display-mode.enum';
import { DisplayDateMode } from '@shared/types/display-date-mode.type';
import { DateRangeConfigurerComponent } from '../date-range-configurer/date-range-configurer.component';

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [TranslateModule, DateRangeConfigurerComponent],
	templateUrl: './header.component.html',
})
export default class HeaderComponent implements OnInit {
	private readonly _localeDateService: LocaleDateService =
		inject(LocaleDateService);

	public dateDisplayMode: InputSignal<DateDisplayMode> =
		input<DateDisplayMode>(DateDisplayMode.None);

	public properDateDisplayMode: WritableSignal<DisplayDateMode> =
		signal<DisplayDateMode>(null);

	ngOnInit(): void {
		this._setProperDateDisplayMode();
	}

	private _setProperDateDisplayMode(): void {
		this.properDateDisplayMode.set(this._getProperDateDisplayMode());
	}

	private _getProperDateDisplayMode(): DisplayDateMode {
		return this.weeklyMode
			? this._localeDateService.weekRange()
			: this.dailyMode
				? this._localeDateService.currentDay()
				: null;
	}

	get weeklyMode(): boolean {
		return this.dateDisplayMode() === DateDisplayMode.Weekly;
	}

	get dailyMode(): boolean {
		return this.dateDisplayMode() === DateDisplayMode.Daily;
	}
}
