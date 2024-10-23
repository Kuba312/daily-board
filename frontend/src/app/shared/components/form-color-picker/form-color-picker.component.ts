import { Component, OnInit, output, OutputEmitterRef, signal, WritableSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import TileColorComponent from './tile-color/tile-color.component';
import SubSectionComponent from '../sub-section/sub-section.component';
import { TILE_COLORS } from '@shared/shared-consts.const';

@Component({
	selector: 'app-form-color-picker',
	standalone: true,
	imports: [TranslateModule, SubSectionComponent, TileColorComponent],
	templateUrl: './form-color-picker.component.html',
})
export default class FormColorPickerComponent implements OnInit{
	public readonly TILE_COLORS: string[] = TILE_COLORS;

	selectedColor: OutputEmitterRef<string> = output<string>();

	selectedIndexColor: WritableSignal<number> = signal<number>(0);

	ngOnInit(): void {
		this.selectColor(0);
	}

	selectColor(index: number): void {
		this.selectedIndexColor.set(index);
		this.selectedColor.emit(TILE_COLORS[index]);
	}
}
