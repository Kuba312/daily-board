import { Component, InputSignal, input } from '@angular/core';
import { Option } from '@app/core/types/basics.types';

@Component({
	selector: 'app-primary-button',
	standalone: true,
	imports: [],
	templateUrl: './primary-button.component.html',
})
export default class PrimaryButtonComponent {
	label: InputSignal<Option<string>> = input<Option<string>>();
	icon: InputSignal<Option<string>> = input<Option<string>>();
 }
