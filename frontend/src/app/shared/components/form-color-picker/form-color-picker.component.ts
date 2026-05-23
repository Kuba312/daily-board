import {
	Component,
	computed,
	inject,
	input,
	InputSignal,
	OnInit,
	output,
	OutputEmitterRef,
	Signal,
	signal,
	WritableSignal,
} from '@angular/core';
import { Option } from '@core/types/basics.types';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { dutyActions } from '@shared-store/duty-store/duty.actions';
import { selectDutiesByPlannerId } from '@shared-store/duty-store/duty.selectors';
import { TILE_COLORS } from '@shared/constants/shared-consts.const';
import { DutyHelperService } from '@shared/services/duty-helper/duty-helper.service';
import { DutyDto } from 'src/api/models';
import SubSectionComponent from '../sub-section/sub-section.component';
import TileColorComponent from './tile-color/tile-color.component';

@Component({
    selector: 'app-form-color-picker',
    imports: [TranslateModule, SubSectionComponent, TileColorComponent],
    templateUrl: './form-color-picker.component.html'
})
export default class FormColorPickerComponent implements OnInit {
	private readonly _store: Store = inject(Store);
	private readonly _dutyHelperService: DutyHelperService =
		inject(DutyHelperService);

	public readonly TILE_COLORS: string[] = TILE_COLORS;

	public readonly plannerId: InputSignal<Option<string>> =
		input<Option<string>>(null);

	public selectedColor: OutputEmitterRef<string> = output<string>();

	public selectedIndexColor: WritableSignal<number> = signal<number>(0);

	public duties: Signal<Option<DutyDto[]>> = computed(() => {
		const plannerId = this.plannerId();

		if (!plannerId) {
			return;
		}

		return this._store.selectSignal(selectDutiesByPlannerId(plannerId))();
	});
	public dutiesGroupedColors: Signal<Map<string, string[]>> =
		computed(() => {
			const duties = this.duties();

			if (!duties || !duties.length) {
				return new Map<string, string[]>([]);
			}

			return this._dutyHelperService.groupDutiesNamesByColors(duties);
		});

	public readonly areDutiesLoaded: Signal<boolean> = computed(() => {
		const duties = this.duties();

		return (
			!!duties &&
			!!duties.length &&
			this._dutyHelperService.amountOfDuties() === duties.length
		);
	});

	public ngOnInit(): void {
		this.selectColor(0);
		this._loadDuties();
	}

	public getDutiesNamesByColor(color: string): Option<string[]> {
		return this.dutiesGroupedColors().get(color);
	}

	public selectColor(index: number): void {
		this.selectedIndexColor.set(index);
		this.selectedColor.emit(TILE_COLORS[index]);
	}

	private _loadDuties(): void {
		const plannerId = this.plannerId();

		if (this.areDutiesLoaded() || !plannerId) {
			return;
		}

		this._dutyHelperService.setAmountOfDuties(this.duties()?.length ?? 0);

		this._store.dispatch(dutyActions.getDutiesByPlannerId({ plannerId }));
	}
}
