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
	public subHeaderTitle: InputSignal<string> = input.required<string>();
	public isExpandableSection: InputSignal<boolean> = input<boolean>(false);
	public expandToFullContentWidth: InputSignal<boolean> = input<boolean>(false);
	public setContentVerticallyFirst: InputSignal<boolean> = input<boolean>(false);
	public notScrollableContainer: InputSignal<boolean> = input<boolean>(false);

	public isSectionHidden: WritableSignal<boolean> = signal<boolean>(false);

	public toggleSection(): void {
		if(!this.isExpandableSection()) {
			return;
		}

		this.isSectionHidden.update((value) => !value);
	}
}
