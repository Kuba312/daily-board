import {
	Component,
	InputSignal,
	OnInit,
	WritableSignal,
	inject,
	input,
	signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Option } from '@core/types/basics.types';
import { TranslateModule } from '@ngx-translate/core';
import { DateDisplayMode } from '@shared/enums/date-display-mode.enum';
import { AdditionalLabelPipe } from '@shared/pipes/additional-label.pipe';
import { LocaleDateService } from '@shared/services/locale-date/locale-date.service';
import { DisplayDateMode } from '@shared/types/display-date-mode.type';
import { DateRangeConfigurerComponent } from '../date-range-configurer/date-range-configurer.component';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [
		TranslateModule,
		MatIconModule,
		DateRangeConfigurerComponent,
		AdditionalLabelPipe,
	],
	templateUrl: './header.component.html',
})
export default class HeaderComponent implements OnInit {
	private readonly _routerHelperService: RouterHelperService = inject(RouterHelperService);
	private readonly _localeDateService: LocaleDateService =
		inject(LocaleDateService);

	public label: InputSignal<string> = input.required<string>();
	public dateDisplayMode: InputSignal<DateDisplayMode> =
		input<DateDisplayMode>(DateDisplayMode.None);
	public additionalTextLabel: InputSignal<Option<string>> =
		input<Option<string>>();
	public backToUrl: InputSignal<Option<string>> = input<Option<string>>();

	public properDateDisplayMode: WritableSignal<DisplayDateMode> =
		signal<DisplayDateMode>(null);

	ngOnInit(): void {
		this._setProperDateDisplayMode();
	}

	public directToPreviousPage(): void {
		const backToUrl = this.backToUrl();

		if(!backToUrl) {
			return;
		}

		this._routerHelperService.directToUrl(backToUrl)
	}

	private _setProperDateDisplayMode(): void {
		this.properDateDisplayMode.set(this._getProperDateDisplayMode());
	}

	private _getProperDateDisplayMode(): DisplayDateMode {
		return this.weeklyMode
			? this._localeDateService.weekRange()
			: this.dailyMode
				? this._localeDateService.getCurrentDay()
				: null;
	}

	get weeklyMode(): boolean {
		return this.dateDisplayMode() === DateDisplayMode.Weekly;
	}

	get dailyMode(): boolean {
		return this.dateDisplayMode() === DateDisplayMode.Daily;
	}
}
