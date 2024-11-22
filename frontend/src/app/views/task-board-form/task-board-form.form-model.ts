import { inject, signal, WritableSignal } from '@angular/core';
import {
	AbstractControl,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { WeekDays } from '@app/enums/week-days.enum';
import { DutyHelperService } from '@shared/services/duty-helper/duty-helper.service';
import { FormFactory } from '@core/services/form-factory/form-factory.service';
import { Option } from '@core/types/basics.types';
import { TranslateService } from '@ngx-translate/core';
import { TextProcessingService } from '@shared/services/text-processing/text-processing.service';
import { TimeValidators } from '@shared/validators/time.validators';
import { DutyDto, PlannerDto } from 'src/api/models';

export class TaskBoardFormModel {
	private readonly _translateService: TranslateService =
		inject(TranslateService);
	private readonly _formFactory: FormFactory = inject(FormFactory);
	private readonly _textProcessingService: TextProcessingService = inject(
		TextProcessingService,
	);
	private readonly _dutyHelperService: DutyHelperService =
		inject(DutyHelperService);

	public readonly NAME: string = 'name';
	public readonly DATE: string = 'date';
	public readonly DESCRIPTION: string = 'description';
	public readonly DAY: string = 'weekDay';

	public formGroup: WritableSignal<FormGroup> = signal<FormGroup>(
		new FormGroup({}),
	);
	public tileColor: WritableSignal<Option<string>> =
		signal<Option<string>>(null);
	public invalidTimeRangesMessage: WritableSignal<
		Option<Record<string, string>>
	> = signal(null);

	constructor(public isConstantPlanner: boolean, public planner: PlannerDto) {
		this._buildForm();
	}

	public toModel(): DutyDto[] {
		const dayControl: WeekDays[] = this.dayControl?.value;
		const duty = {
			name: this.formGroup().get(this.NAME)?.value,
			description: this.formGroup().get(this.DESCRIPTION)?.value ?? null,
			from: this.dateControl
				? this._textProcessingService.extractFromHourFromControl(
						this.dateControl.value,
				  )
				: undefined,
			to: this.dateControl
				? this._textProcessingService.extractToHourFromControl(
						this.dateControl.value,
				  )
				: undefined,
			...(this.tileColor() && {
				color: this.tileColor() ?? undefined,
			}),
		};

		return this.isConstantPlanner
			? this._dutyHelperService.crateArrayOfDutiesBasedOnWeekDays(
					dayControl,
					duty,
			  )
			: [duty];
	}

	public dayOptions(): string[] {
		return Object.values(WeekDays);
	}

	public clearForm(): void {
		this.formGroup().reset();
	}

	private _buildForm(): void {
		const { startTime, endTime } = this.planner;

		if (!startTime || !endTime) {
			return;
		}

		this.formGroup.set(
			this._formFactory.createForm({
				controls: {
					[this.NAME]: new FormControl('', [Validators.required]),
					[this.DATE]: new FormControl('', [
						Validators.required,
						...(this.isConstantPlanner
							? []
							: [TimeValidators.validateDate()]),
						TimeValidators.validateTime(),
						TimeValidators.validateTimeRanges(startTime, endTime),
						TimeValidators.validateMinimumTimeDifference(),
					]),
					[this.DESCRIPTION]: new FormControl(''),
					...(this.isConstantPlanner && {
						[this.DAY]: new FormControl('', [Validators.required]),
					}),
				},
			}),
		);

		this.setInvalidTimeRangesMessage();
	}

	private setInvalidTimeRangesMessage(): void {
		const { startTime, endTime } = this.planner;

		this.invalidTimeRangesMessage.set({
			invalidRangeTime: this._translateService.instant(
				'form-validators.invalid-time-range',
				{
					startTime,
					endTime,
				},
			),
		});
	}

	get dateControl(): Option<AbstractControl> {
		return this.formGroup().get(this.DATE);
	}

	get dayControl(): Option<AbstractControl> {
		return this.formGroup().get(this.DAY);
	}
}
