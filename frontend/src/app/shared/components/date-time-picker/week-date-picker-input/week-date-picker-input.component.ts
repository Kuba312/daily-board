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
	ControlValueAccessor,
	FormGroup,
	NG_VALUE_ACCESSOR,
	ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Option } from '@core/types/basics.types';
import { ControlNameWeekRanger } from '@shared/enums/control-name-week-ranger.type';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { FormErrorMessageComponent } from '../../form-error-message/form-error-message.component';
import CalendarWeeksRangerComponent from '../calendar-weeks-ranger/calendar-weeks-ranger.component';
import { TIME_MASK_FORMAT } from '@shared/shared-consts.const';

@Component({
	selector: 'app-week-date-picker-input',
	standalone: true,
	imports: [
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
	fromInput: Signal<Option<ElementRef>> = viewChild<ElementRef>('fromInput');
	toInput: Signal<Option<ElementRef>> = viewChild<ElementRef>('toInput');

	public readonly TIME_MASK_FORMAT: string = TIME_MASK_FORMAT;

	public formGroup: InputSignal<FormGroup> = input.required<FormGroup>();
	public controlName: InputSignal<string> = input.required<string>();
	public customErrorMessages: InputSignal<Option<Record<string, string>>> =
		input<Option<Record<string, string>>>(null);
	public width: InputSignal<number> = input<number>(30);

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
		this.selectedDate.set(date);
	}

	registerOnChange(fn: (date: string) => void): void {
		this._onChange.set(fn);
	}

	registerOnTouched(fn: () => void): void {
		console.log('on touched registered!!!');

		this._onTouched.set(fn);
	}

	setDisabledState?(isDisabled: boolean): void {
	}

	handleDateChange(event: Event, controlName: ControlNameWeekRanger): void {
		console.log('handleDateChange!!!!!!!');
		event.stopPropagation();
		const target = event.target;

		if (!(target instanceof HTMLInputElement)) {
			return;
		}

		const date = target.value;

		this._adjustTypedDate(date, controlName);

		const builtDate = `${this.date()}, ${this.from()} - ${this.to()}`;

		console.log(builtDate);

		this._triggerFormNotifiers(builtDate);
	}

	touchControl(): void {
		if (this._onTouched()) {
			this._onTouched()();
		}
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

	toggleCalendarWeek(): void {
		this.isWeeklyCalendarOpened.update((value) => !value);
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
}
