import {
	Component,
	inject,
	input,
	InputSignal,
	model,
	ModelSignal,
} from '@angular/core';
import {
	AbstractControl,
	FormGroup,
	ReactiveFormsModule,
} from '@angular/forms';
import { DateHelperService } from '@shared/services/locale-date/date-helper.service';
import { Option } from '@core/types/basics.types';
import { TranslateModule } from '@ngx-translate/core';
import WeekDatePickerInputComponent 
	from '@shared/components/date-time-picker/week-date-picker-input/week-date-picker-input.component';
import PrimaryButtonComponent from '@shared/components/primary-button/primary-button.component';
import SubSectionComponent from '@shared/components/sub-section/sub-section.component';
import ChipTagsContainerComponent from '../chip-tags-container/chip-tags-container.component';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';

@Component({
    selector: 'app-task-input-date',
    imports: [
        TranslateModule,
        SubSectionComponent,
        WeekDatePickerInputComponent,
        ReactiveFormsModule,
        PrimaryButtonComponent,
        ChipTagsContainerComponent,
    ],
    templateUrl: './task-input-date.component.html',
    styleUrl: './task-input-date.component.scss'
})
export default class TaskInputDateComponent {
	private readonly _dateHelperService: DateHelperService =
		inject(DateHelperService);
	private readonly _snackBarService: SnackBarService =
		inject(SnackBarService);

	private readonly OVERLAPPED_TASK_TIME_ERROR: string =
		'task-board-form.added-time-is-overrode';

	public controlName: InputSignal<string> = input.required<string>();
	public formGroup: InputSignal<FormGroup> = input.required<FormGroup>();

	public label: InputSignal<Option<string>> = input<Option<string>>(null);
	public customErrorMessages: InputSignal<Option<Record<string, string>>> =
		input<Option<Record<string, string>>>(null);
	public onlyHours: InputSignal<boolean> = input<boolean>(false);
	public isConstantPlanner: InputSignal<boolean> = input<boolean>(false);
	public showDateChips: InputSignal<boolean> = input<boolean>(true);

	public addedChipTagsDates: ModelSignal<Option<string[]>> =
		model<Option<string[]>>(null);

	public onAddChipTagDate(): void {
		const dateControlValue = this.dateControl?.value;

		if (!dateControlValue) {
			return;
		}

		if (this._isDateTimeOverlapped(dateControlValue)) {
			this._snackBarService.onShowSnackBarError({
				message: this.OVERLAPPED_TASK_TIME_ERROR,
			});

			return;
		}

		this._addDutyTime(dateControlValue);
	}

	public onChipTagDateRemoved(chipIndex: number): void {
		const chipTags = this.addedChipTagsDates();

		if (!chipTags) {
			return;
		}

		this._removeDutyTime(chipTags, chipIndex);
	}

	private _removeDutyTime(chipTags: string[], chipIndex: number): void {
		const timeTagsAfterDeletion = chipTags.filter(
			(_tag, i) => chipIndex !== i,
		);

		this.addedChipTagsDates.set(timeTagsAfterDeletion);
	}

	private _addDutyTime(dateControlValue: string): void {
		this.addedChipTagsDates.update((prevTags) =>
			prevTags ? [...prevTags, dateControlValue] : [dateControlValue],
		);
	}

	private _isDateTimeOverlapped(dateControlValue: string): boolean {
		return (
			this.addedChipTagsDates()?.some((alreadyAddedDate) =>
				this._dateHelperService.isDateTimesOverlapped(
					dateControlValue,
					alreadyAddedDate,
				),
			) ?? false
		);
	}

	get dateControl(): Option<AbstractControl> {
		return this.formGroup().get(this.controlName());
	}

	get invalidDateControl(): boolean {
		return (this.dateControl?.invalid || !this.dateControl?.value) ?? true;
	}
}
