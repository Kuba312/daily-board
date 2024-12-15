import {
	Component,
	ElementRef,
	forwardRef,
	input,
	InputSignal,
	Signal,
	signal,
	viewChild,
	WritableSignal,
} from '@angular/core';
import {
	AbstractControl,
	ControlValueAccessor,
	FormGroup,
	FormsModule,
	NG_VALUE_ACCESSOR,
	ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Option } from '@core/types/basics.types';
import { DATE_PLACEHOLDER, DAY_MONTH_FORMAT, TIME_MASK_FORMAT, TIME_PLACEHOLDER } 
	from '@shared/constants/shared-consts.const';
import { ControlNameWeekRanger } from '@shared/enums/control-name-week-ranger.enum';
import { CalendarDateDetails } from '@shared/models/calendar-date-details';
import moment from 'moment';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import FormErrorMessageComponent from '../../form-error-message/form-error-message.component';
import CalendarWeeksRangerComponent from '../calendar-weeks-ranger/calendar-weeks-ranger.component';

@Component({
	selector: 'app-week-date-picker-input',
	standalone: true,
	imports: [
		FormsModule,
		ReactiveFormsModule,
		MatInputModule,
		MatFormFieldModule,
		NgxMaskDirective,
		MatIconModule,
		CalendarWeeksRangerComponent,
		FormErrorMessageComponent,
	],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => WeekDatePickerInputComponent),
			multi: true,
		},
		provideNgxMask(),
	],
	templateUrl: './week-date-picker-input.component.html',
})
export default class WeekDatePickerInputComponent
	implements ControlValueAccessor
{
	public fromInput: Signal<Option<ElementRef>> = viewChild<ElementRef>('fromInput');
	public toInput: Signal<Option<ElementRef>> = viewChild<ElementRef>('toInput');
	public dateInput: Signal<Option<ElementRef>> = viewChild<ElementRef>('dateInput');

	public readonly TIME_MASK_FORMAT: string = TIME_MASK_FORMAT;

	private readonly INVALID_DATE_ERROR: string = 'invalidDate';

	public formGroup: InputSignal<FormGroup> = input.required<FormGroup>();
	public controlName: InputSignal<string> = input.required<string>();
	public label: InputSignal<Option<string>> = input<Option<string>>(null);
	public customErrorMessages: InputSignal<Option<Record<string, string>>> =
		input<Option<Record<string, string>>>(null);
	public width: InputSignal<number> = input<number>(100);
	public onlyHours: InputSignal<boolean> = input<boolean>(false);

	public isWeeklyCalendarOpened: WritableSignal<boolean> =
		signal<boolean>(false);
	public selectedDate: WritableSignal<Option<string>> =
		signal<Option<string>>(null);
	public date: WritableSignal<Option<string>> = signal<Option<string>>(null);
	public from: WritableSignal<Option<string>> = signal<Option<string>>(null);
	public to: WritableSignal<Option<string>> = signal<Option<string>>(null);

	public controlDateName: typeof ControlNameWeekRanger =
		ControlNameWeekRanger;

	private _onChange: WritableSignal<(date: string) => void> = signal(() => {
		return;
	});
	private _onTouched: WritableSignal<() => void> = signal(() => {
		return;
	});

	writeValue(date: string): void {
		this._clearTimeValues(date);

		this.selectedDate.set(date);
	}

	registerOnChange(fn: (date: string) => void): void {
		this._onChange.set(fn);
	}

	registerOnTouched(fn: () => void): void {
		this._onTouched.set(fn);
	}

	handleDateChange(event: Event, controlName: ControlNameWeekRanger): void {
		event.stopPropagation();

		const target = event.target;

		if (!(target instanceof HTMLInputElement)) {
			return;
		}

		let date = target.value;

		if (this._isEmptyDate(date)) {
			date = '';
		}

		this._adjustTypedDate(date, controlName);
		this._generateNotifierDate();
	}

	touchControl(): void {
		if (this._onTouched()) {
			this._onTouched()();
		}
	}

	toggleCalendarWeek(): void {
		this.isWeeklyCalendarOpened.update((value) => !value);
	}

	onCloseCalendarWeek(calendarDatesDetails: CalendarDateDetails): void {
		this.isWeeklyCalendarOpened.update((value) => !value);

		this._updateCalendarInputs(calendarDatesDetails);
		this._generateNotifierDate();
	}

	private _triggerFormNotifiers(date: string): void {
		this.touchControl();

		if (this._onChange()) {
			this._onChange()(date);
		}
	}

	private _adjustTypedDate(
		date: string,
		controlName: ControlNameWeekRanger,
	): void {
		switch (controlName) {
			case ControlNameWeekRanger.Date:
				if(!date) {
					this.date.set(DATE_PLACEHOLDER);

					return;
				}
				
				this.date.set(date);
				this._focusOnFromInput();

				break;
			case ControlNameWeekRanger.From:
				this.from.set(date);
				this._focusOnToInput();

				break;
			default:
				this.to.set(date);

				break;
		}
	}

	private _focusOnFromInput(): void {
		if (!this._isDateFull()) {
			return;
		}

		this.fromInput()?.nativeElement.focus();
	}

	private _focusOnToInput(): void {
		if (!this._isTimeFull()) {
			return;
		}

		this.toInput()?.nativeElement.focus();
	}

	private _isDateFull(): boolean {
		return this.date()?.length === 10 && !this.date()?.includes('_');
	}

	private _isTimeFull(): boolean {
		return this.from()?.length === 5 && !this.from()?.includes('_');
	}

	private _isEmptyDate(date: string): boolean {
		return !!date && !!date.includes(DATE_PLACEHOLDER);
	}

	private _updateCalendarInputs(
		calendarDatesDetails: CalendarDateDetails,
	): void {
		const { date, from, to } = calendarDatesDetails;
		const dateInput = this.dateInput();
		const fromInput = this.fromInput();
		const toInput = this.toInput();

		if (date && dateInput) {
			this.date.set(moment(date).format(DAY_MONTH_FORMAT));
			dateInput.nativeElement.value = this.date();
		}

		if (from && fromInput) {
			this.from.set(from);
			fromInput.nativeElement.value = this.from();
		}

		if (to && toInput) {
			this.to.set(to);
			toInput.nativeElement.value = this.to();
		}
	}

	private _clearTimeValues(date: string): void {
		if (!date) {
			this.from.set(TIME_PLACEHOLDER);
			this.to.set(TIME_PLACEHOLDER);
			this.date.set(DATE_PLACEHOLDER);
		}
	}

	private _generateNotifierDate(): void {
		const builtDate = `${this.date()}, ${this.from()} - ${this.to()}`;

		this._triggerFormNotifiers(builtDate);
	}

	get controlDate(): Option<AbstractControl> {
		return this.formGroup().get(this.controlName());
	}
}
