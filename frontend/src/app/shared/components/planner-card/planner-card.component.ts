import { NgClass } from '@angular/common';
import {
	Component,
	input,
	InputSignal,
	output,
	OutputEmitterRef,
} from '@angular/core';
import { PlannerDto } from 'src/api/models';

@Component({
	selector: 'app-planner-card',
	standalone: true,
	imports: [NgClass],
	templateUrl: './planner-card.component.html',
})
export default class PlannerCardComponent {
	public plannerDetails: InputSignal<PlannerDto> =
		input.required<PlannerDto>();
	public emitSelection: InputSignal<boolean> = input<boolean>(false);
	public isSelectedCard: InputSignal<boolean> = input<boolean>(false);

	public ngClickPlannerCard: OutputEmitterRef<PlannerDto> = output<PlannerDto>();

	onSelectedPlannerCard(): void {
		const planner = this.plannerDetails();

		if (!this.emitSelection() || !planner) {
			return;
		}

		this.ngClickPlannerCard.emit(planner);
	}
}
