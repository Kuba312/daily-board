import {
	Component,
	InputSignal,
	OnDestroy,
	OnInit,
	Signal,
	WritableSignal,
	computed,
	inject,
	input,
	signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Option } from '@core/types/basics.types';
import { TranslateModule } from '@ngx-translate/core';
import { DateDisplayMode } from '@shared/enums/date-display-mode.enum';
import { AdditionalLabelPipe } from '@shared/pipes/additional-label.pipe';
import { DateHelperService } from '@shared/services/locale-date/date-helper.service';
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
export default class HeaderComponent implements OnInit, OnDestroy {
	private readonly _routerHelperService: RouterHelperService = inject(RouterHelperService);
	private readonly _dateHelperService: DateHelperService =
		inject(DateHelperService);

	public label: InputSignal<string> = input.required<string>();
	public dateDisplayMode: InputSignal<DateDisplayMode> =
		input<DateDisplayMode>(DateDisplayMode.None);
	public additionalTextLabel: InputSignal<Option<string>> =
		input<Option<string>>();
	public backToUrl: InputSignal<Option<string>> = input<Option<string>>();
	public useTranslate: InputSignal<boolean> = input<boolean>(true);

	public properDateDisplayMode: WritableSignal<DisplayDateMode> =
		signal<DisplayDateMode>(null);

	public weekPeriodRange: Signal<DisplayDateMode> = computed(() =>
		this._dateHelperService.updatedWeekPeriod() ?? this.properDateDisplayMode(),
	)

	ngOnInit(): void {
		this._setProperDateDisplayMode();
	}

	ngOnDestroy(): void {
		this._dateHelperService.resetUpdatedWeekPeriod();
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
			? this._dateHelperService.currentWeekRange()
			: this.dailyMode
				? this._dateHelperService.getCurrentDay()
				: null;
	}

	get weeklyMode(): boolean {
		return this.dateDisplayMode() === DateDisplayMode.Weekly;
	}

	get dailyMode(): boolean {
		return this.dateDisplayMode() === DateDisplayMode.Daily;
	}
}
