import { inject, signal, WritableSignal } from '@angular/core';
import {
	AbstractControl,
	FormControl,
	FormGroup,
	Validators,
} from '@angular/forms';
import { WeekDays } from '@app/enums/week-days.enum';
import { FormFactory } from '@core/services/form-factory/form-factory.service';
import { Option } from '@core/types/basics.types';
import { TranslateService } from '@ngx-translate/core';
import {
	DAY_MONTH_FORMAT,
	YEAR_MOTH_DAY_FORMAT,
} from '@shared/constants/shared-consts.const';
import { DutyHelperService } from '@shared/services/duty-helper/duty-helper.service';
import { TextProcessingService } from '@shared/services/text-processing/text-processing.service';
import { TimeValidators } from '@shared/validators/time.validators';
import moment from 'moment';
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
	public addedChipTagsDates: WritableSignal<Option<string[]>> =
		signal<Option<string[]>>(null);

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
				: '',
			to: this.dateControl
				? this._textProcessingService.extractToHourFromControl(
						this.dateControl.value,
				  )
				: '',
			...(this.tileColor() && {
				color: this.tileColor() ?? undefined,
			}),
		};

		return this._divideDutyTimesIntoArray(dayControl, duty);
	}

	public dayOptions(): string[] {
		return Object.values(WeekDays);
	}

	public clearForm(): void {
		this.formGroup().reset();
	}

	public patchDuty(duty: DutyDto): void {
		const dateValue = this._getDutyDateControlValue(duty);

		this.formGroup().patchValue({
			[this.NAME]: duty.name ?? '',
			[this.DATE]: dateValue,
			[this.DESCRIPTION]: duty.description ?? '',
			...(this.isConstantPlanner && {
				[this.DAY]: duty.weekDay ?? null,
			}),
		});
		this.tileColor.set(duty.color ?? null);

		if (!this.isConstantPlanner) {
			this.addedChipTagsDates.set(dateValue ? [dateValue] : null);
		}
	}

	public toSingleModel(existingDuty: DutyDto): DutyDto {
		const duty = this._buildBaseDuty();
		const dutyWithIdentity = {
			...duty,
			id: existingDuty.id,
			plannerId: existingDuty.plannerId,
		};

		if (this.isConstantPlanner) {
			return {
				...dutyWithIdentity,
				weekDay: this._getSelectedWeekDay(),
			};
		}

		return {
			...this._dutyHelperService.createArrayOfDutiesBasedOnTimes(
				[this.dateControl?.value],
				dutyWithIdentity,
			)[0],
			id: existingDuty.id,
			plannerId: existingDuty.plannerId,
		};
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
						...(this.isConstantPlanner
							? [Validators.required]
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

	private _buildBaseDuty(): DutyDto {
		return {
			name: this.formGroup().get(this.NAME)?.value,
			description: this.formGroup().get(this.DESCRIPTION)?.value ?? null,
			from: this.dateControl
				? this._textProcessingService.extractFromHourFromControl(
						this.dateControl.value,
				  )
				: '',
			to: this.dateControl
				? this._textProcessingService.extractToHourFromControl(
						this.dateControl.value,
				  )
				: '',
			...(this.tileColor() && {
				color: this.tileColor() ?? undefined,
			}),
		};
	}

	private _getSelectedWeekDay(): WeekDays {
		const weekDay = this.dayControl?.value;

		return Array.isArray(weekDay) ? weekDay[0] : weekDay;
	}

	private _getDutyDateControlValue(duty: DutyDto): string {
		const timeRange = `${duty.from} - ${duty.to}`;

		if (this.isConstantPlanner) {
			return `null, ${timeRange}`;
		}

		const effectiveDate = duty.effectiveDate
			? moment(duty.effectiveDate, YEAR_MOTH_DAY_FORMAT).format(
					DAY_MONTH_FORMAT,
			  )
			: '';

		return `${effectiveDate}, ${timeRange}`;
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

	private _divideDutyTimesIntoArray(
		dayControl: WeekDays[],
		duty: DutyDto,
	): DutyDto[] {
		const addedDutyTimesChipsTags = this.addedChipTagsDates();

		return this.isConstantPlanner
			? this._dutyHelperService.crateArrayOfDutiesBasedOnWeekDays(
					dayControl,
					duty,
			  )
			: addedDutyTimesChipsTags
			? this._dutyHelperService.createArrayOfDutiesBasedOnTimes(
					addedDutyTimesChipsTags,
					duty,
			  )
			: [];
	}

	get dateControl(): Option<AbstractControl> {
		return this.formGroup().get(this.DATE);
	}

	get dayControl(): Option<AbstractControl> {
		return this.formGroup().get(this.DAY);
	}
}
