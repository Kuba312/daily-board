import { NgClass } from '@angular/common';
import {
	Component,
	input,
	InputSignal,
	output,
	OutputEmitterRef,
} from '@angular/core';
import { PopoverPosition } from '@shared/enums/popover-positon.enum';
import { Option } from '@core/types/basics.types';
import { TranslateModule } from '@ngx-translate/core';
import { PopoverDirective } from '@shared/directives/popover.directive';

@Component({
    selector: 'app-tile-color',
    imports: [NgClass, PopoverDirective, TranslateModule],
    templateUrl: './tile-color.component.html',
})
export default class TileColorComponent {
	public tileColor: InputSignal<string> = input.required<string>();
	public isChosenColor: InputSignal<boolean> = input.required<boolean>();
	public dutiesNames: InputSignal<Option<string[]>> =
		input.required<Option<string[]>>();

	public ngClickColorTile: OutputEmitterRef<string> = output<string>();

	public readonly tooltipPosition: PopoverPosition = PopoverPosition.Left; 

}
