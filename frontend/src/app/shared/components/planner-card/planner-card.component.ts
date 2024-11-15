import { NgClass } from '@angular/common';
import {
	Component,
	input,
	InputSignal,
	output,
	OutputEmitterRef,
} from '@angular/core';
import { ButtonConfig } from '@shared/models/button-config';
import { PlannerDto } from 'src/api/models';
import PrimaryButtonComponent from '../primary-button/primary-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Option } from '@core/types/basics.types';

@Component({
	selector: 'app-planner-card',
	standalone: true,
	imports: [TranslateModule, NgClass, PrimaryButtonComponent],
	templateUrl: './planner-card.component.html',
})
export default class PlannerCardComponent {
	public plannerDetails: InputSignal<PlannerDto> =
		input.required<PlannerDto>();
	public emitSelection: InputSignal<boolean> = input<boolean>(false);
	public isSelectedCard: InputSignal<boolean> = input<boolean>(false);
	public cardHeightInRem: InputSignal<Option<number>> = input<Option<number>>(null);
	public buttons: InputSignal<ButtonConfig[]> = input<ButtonConfig[]>([]);

	public ngClickPlannerCard: OutputEmitterRef<PlannerDto> =
		output<PlannerDto>();

	onSelectedPlannerCard(): void {
		const planner = this.plannerDetails();

		if (!this.emitSelection() || !planner) {
			return;
		}

		this.ngClickPlannerCard.emit(planner);
	}
}
