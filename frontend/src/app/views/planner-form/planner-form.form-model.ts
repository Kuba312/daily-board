import { inject, signal, WritableSignal } from '@angular/core';
import {
	AbstractControl,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { SelectPair } from '@core/models/select';
import { FormFactory } from '@core/services/form-factory/form-factory.service';
import { ChippedTypeKey, Option } from '@core/types/basics.types';
import { TIME_MASK_FORMAT } from '@shared/constants/shared-consts.const';
import { TextProcessingService } from '@shared/services/text-processing/text-processing.service';
import { TimeValidators } from '@shared/validators/time.validators';
import { PlannerDto } from 'src/api/models';

export class PlannerFormModel {
	private readonly _formFactory: FormFactory = inject(FormFactory);
	private readonly _textProcessingService: TextProcessingService = inject(
		TextProcessingService,
	);

	public readonly NAME: string = 'name';
	public readonly NOTE: string = 'note';
	public readonly RANGE_TIME: string = 'rangeTime';
	public readonly IS_CONSTANT: string = 'isConstant';

	public readonly SELECT_VALUE_TO_SHOW: ChippedTypeKey<
		SelectPair<string, boolean>
	> = 'label';
	public readonly SELECT_VALUE_TO_SEND: ChippedTypeKey<
		SelectPair<string, boolean>
	> = 'value';
	public readonly TIME_MASK_FORMAT: string = TIME_MASK_FORMAT;

	public formGroup: WritableSignal<FormGroup> = signal(new FormGroup({}));

	constructor(planner?: PlannerDto) {
		this._buildForm();

		if (planner) {
			this.patchPlanner(planner);
		}
	}

	public toModel(): PlannerDto {
		return {
			name: this.formGroup().get(this.NAME)?.value,
			note: this.formGroup().get(this.NOTE)?.value,
			isConstant: this.formGroup().get(this.IS_CONSTANT)?.value,
			startTime: this.rangeTimeControl
				? this._textProcessingService.extractFromHourFromControl(
						this.rangeTimeControl.value,
				  )
				: undefined,
			endTime: this.rangeTimeControl
				? this._textProcessingService.extractToHourFromControl(
						this.rangeTimeControl.value,
				  )
				: undefined,
		};
	}

	public clearForm(): void { 
		this.formGroup().reset();
	}

	public patchPlanner(planner: PlannerDto): void {
		this.formGroup().patchValue({
			[this.NAME]: planner.name ?? '',
			[this.NOTE]: planner.note ?? '',
			[this.RANGE_TIME]:
				planner.startTime && planner.endTime
					? `null, ${planner.startTime} - ${planner.endTime}`
					: '',
			[this.IS_CONSTANT]: planner.isConstant ?? null,
		});
	}

	public getPlannerModes(): SelectPair<string, boolean>[] {
		return [
			{
				label: 'dynamic-planner',
				value: false,
			},
			{
				label: 'constant-planner',
				value: true,
			},
		];
	}

	private _buildForm(): void {
		this.formGroup.set(
			this._formFactory.createForm({
				controls: {
					[this.NAME]: new FormControl('', [Validators.required]),
					[this.NOTE]: new FormControl(''),
					[this.RANGE_TIME]: new FormControl('', [
						Validators.required,
						TimeValidators.validateTime(),
						TimeValidators.validFullTime(),
						TimeValidators.validateEnoughTimeDifference(),
					]),
					[this.IS_CONSTANT]: new FormControl(null, [
						Validators.required,
					]),
				},
			}),
		);
	}

	get rangeTimeControl(): Option<AbstractControl> {
		return this.formGroup().get(this.RANGE_TIME);
	}
}
