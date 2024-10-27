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
import { TextProcessingService } from '@shared/services/text-processing/text-processing.service';
import { TimeValidators } from '@shared/validators/time.validators';
import { DutyDto } from 'src/api/models';

export class TaskBoardFormModel {
	private readonly _formFactory: FormFactory = inject(FormFactory);
	private readonly _textProcessingService: TextProcessingService = inject(
		TextProcessingService,
	);

	public readonly NAME: string = 'name';
	public readonly DATE: string = 'date';
	public readonly DESCRIPTION: string = 'description';
	public readonly DAY: string = 'weekDay';

	public formGroup: WritableSignal<FormGroup> = signal<FormGroup>(
		new FormGroup({}),
	);
	public tileColor: WritableSignal<Option<string>> =
		signal<Option<string>>(null);
	public isOnlyHourConfig: WritableSignal<boolean> = signal<boolean>(true);

	constructor() {
		this._buildForm();
	}

	public toModel(): DutyDto {
		return {
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
			...(this.isOnlyHourConfig() && {
				weekDay: this.formGroup().get(this.DAY)?.value.toUpperCase(),
			}),
			...(this.tileColor() && {
				color: this.tileColor() ?? undefined,
			}),
		};
	}

	public dayOptions(): string[] {
		return Object.values(WeekDays).map((val) => val.toLowerCase());
	}

	private _buildForm(): void {
		this.formGroup.set(
			this._formFactory.createForm({
				controls: {
					[this.NAME]: new FormControl('', [Validators.required]),
					[this.DATE]: new FormControl('', [
						Validators.required,
						...(this.isOnlyHourConfig()
							? []
							: [TimeValidators.validateDate()]),
						TimeValidators.validateTime(),
					]),
					[this.DESCRIPTION]: new FormControl(''),
					...(this.isOnlyHourConfig() && {
						[this.DAY]: new FormControl('', [Validators.required]),
					}),
				},
			}),
		);
	}

	get dateControl(): Option<AbstractControl> {
		return this.formGroup().get(this.DATE);
	}
}
