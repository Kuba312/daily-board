import { NgClass } from '@angular/common';
import {
	Component,
	input,
	InputSignal,
	output,
	OutputEmitterRef,
} from '@angular/core';

@Component({
	selector: 'app-tile-color',
	standalone: true,
	imports: [NgClass],
	templateUrl: './tile-color.component.html',
})
export default class TileColorComponent {
	tileColor: InputSignal<string> = input.required<string>();
	isChosenColor: InputSignal<boolean> = input.required<boolean>();

	ngClickColorTile: OutputEmitterRef<string> = output<string>();
}
