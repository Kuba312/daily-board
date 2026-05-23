import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { Option } from '@core/types/basics.types';
import ChipTagComponent from '@shared/components/chip-tag/chip-tag.component';

@Component({
    selector: 'app-chip-tags-container',
    imports: [ChipTagComponent],
    templateUrl: './chip-tags-container.component.html',
    styleUrl: './chip-tags-container.component.scss'
})
export default class ChipTagsContainerComponent {
	public chipTagsDates: InputSignal<Option<string[]>> =
		input<Option<string[]>>(null);
	
	public chipRemovedIndex: OutputEmitterRef<number> = output<number>();

}
