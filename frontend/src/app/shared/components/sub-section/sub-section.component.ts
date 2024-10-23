import { NgClass } from '@angular/common';
import {
	Component,
	input,
	InputSignal,
	signal,
	WritableSignal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
	selector: 'app-sub-section',
	standalone: true,
	imports: [NgClass, MatIcon],
	templateUrl: './sub-section.component.html',
})
export default class SubSectionComponent {
	subHeaderTitle: InputSignal<string> = input.required<string>();
	isExpandableSection: InputSignal<boolean> = input<boolean>(false);

	isSectionHidden: WritableSignal<boolean> = signal<boolean>(false);

	toggleSection(): void {
		if(!this.isExpandableSection()) {
			return;
		}

		this.isSectionHidden.update((value) => !value);
	}
}
