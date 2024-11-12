import { NgClass } from '@angular/common';
import { Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { Option } from '@core/types/basics.types';

@Component({
	selector: 'app-primary-button',
	standalone: true,
	imports: [NgClass],
	templateUrl: './primary-button.component.html',
})
export default class PrimaryButtonComponent {
	label: InputSignal<Option<string>> = input<Option<string>>();
	icon: InputSignal<Option<string>> = input<Option<string>>();
	secondary: InputSignal<Option<boolean>> = input<Option<boolean>>();
	emitOnClick: InputSignal<boolean> = input<boolean>(false);
	width: InputSignal<Option<number>> = input<Option<number>>(null);
	disabled: InputSignal<boolean> = input<boolean>(false);

	ngClick: OutputEmitterRef<void> = output<void>();

	onNgClick(): void {
		if(!this.emitOnClick()) {
			return;
		}

		this.ngClick.emit();
	}
 }
