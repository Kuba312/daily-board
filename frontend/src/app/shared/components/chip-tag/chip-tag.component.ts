import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-chip-tag',
    imports: [MatIcon],
    templateUrl: './chip-tag.component.html'
})
export default class ChipTagComponent {
	public chipContent: InputSignal<string> = input.required<string>();
	public index: InputSignal<number> = input.required<number>();

	public onChipRemoved: OutputEmitterRef<number> = output<number>();
}
