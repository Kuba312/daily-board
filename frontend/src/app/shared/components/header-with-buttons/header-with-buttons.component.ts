import { Component, input, InputSignal } from '@angular/core';
import HeaderComponent from '../header/header.component';
import { DateDisplayMode } from '@shared/enums/date-display-mode.enum';
import { ButtonConfig } from '@shared/models/button-config';
import PrimaryButtonComponent from '../primary-button/primary-button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'app-header-with-buttons',
	standalone: true,
	imports: [TranslateModule, HeaderComponent, PrimaryButtonComponent],
	templateUrl: './header-with-buttons.component.html',
})
export default class HeaderWithButtonsComponent {
	public label: InputSignal<string> = input.required<string>();
	public buttons: InputSignal<ButtonConfig[]> =
		input.required<ButtonConfig[]>();
	public dateDisplayMode: InputSignal<DateDisplayMode> =
		input<DateDisplayMode>(DateDisplayMode.None);
}
