import { NgClass } from '@angular/common';
import {
	Component,
	computed,
	HostListener,
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SHORT_NAME_DAYS } from '@core/app.consts';
import { Option } from '@core/types/basics.types';
import { TranslateModule } from '@ngx-translate/core';
import {
	DATE_PLACEHOLDER,
	DAY_MONTH_FORMAT,
	YEAR_MOTH_DAY_FORMAT,
} from '@shared/constants/shared-consts.const';
import { CalendarDateDetails } from '@shared/models/calendar-date-details';
import { DayDate } from '@shared/models/date-day';
import LocaleDatePipe from '@shared/pipes/locale-date.pipe';
import SafeValue from '@shared/pipes/safe-value.pipe';
import { DateHelperService } from '@shared/services/locale-date/date-helper.service';
import { TimeValueConnectorService } from '@shared/services/time-value-connector.service';
import moment from 'moment';
import CalendarTimeRangerComponent from '../calendar-time-ranger/calendar-time-ranger.component';

@Component({
    selector: 'app-calendar-weeks-ranger',
    imports: [
        FormsModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        TranslateModule,
        MatIconModule,
        LocaleDatePipe,
        SafeValue,
        CalendarTimeRangerComponent,
        NgClass,
    ],
    templateUrl: './calendar-weeks-ranger.component.html',
})
export default class CalendarWeeksRangerComponent implements OnInit {
	private readonly _dateHelperService: DateHelperService =
		inject(DateHelperService);
	private readonly _timeValueConnector: TimeValueConnectorService = inject(
		TimeValueConnectorService,
	);

	public width: InputSignal<number> = input<number>(25);
	public inputDate: InputSignal<Option<string>> = input<Option<string>>(null);
	public fromTime: InputSignal<Option<string>> = input<Option<string>>(null);
	public toTime: InputSignal<Option<string>> = input<Option<string>>(null);

	// eslint-disable-next-line @angular-eslint/no-output-on-prefix
	public onCloseCalendar: OutputEmitterRef<CalendarDateDetails> =
		output<CalendarDateDetails>();

	public readonly DAY_MONTH_FORMAT: string = 'MMMM YYYY';
	public readonly DAYS: string[] = SHORT_NAME_DAYS;

	public currentMonth: WritableSignal<string> = signal(
		this._dateHelperService.getCurrentDay(),
	);
	public nextMonthValue: WritableSignal<Option<string>> =
		signal<Option<string>>(null);
	public mothsDaysChunks: WritableSignal<(string | DayDate)[][]> = signal([]);
	public fromTimeValue: WritableSignal<Option<string>> =
		signal<Option<string>>(null);
	public toTimeValue: WritableSignal<Option<string>> =
		signal<Option<string>>(null);

	public selectedDay: Signal<Option<string>> = computed(
		() =>
			this._extractDay(this.inputDate(), true) ??
			this._extractDay(this.currentMonth()),
	);
	public selectedMonth: WritableSignal<Option<string>> = signal(
		this._dateHelperService.getCurrentDay(),
	);
	public userSelectedDate: WritableSignal<string> = signal('');

	ngOnInit(): void {
		this._setUserCalendarDate();
		this._setMonthDaysChunks();
	}

	@HostListener('document:keydown.enter', ['$event'])
	onEnterPress(event: Event | null): void {
		if (event instanceof KeyboardEvent && event.key === 'Enter') {
			this.closeCalendar();
		}
	}

	closeCalendar(): void {
		const from = this._timeValueConnector.timeValueFrom() ?? '';
		const to = this._timeValueConnector.timeValueTo() ?? '';
		const date =
			this.userSelectedDate() ||
			this._dateHelperService.stringToDate(
				this.currentMonth(),
				YEAR_MOTH_DAY_FORMAT,
			) ||
			'';

		this.onCloseCalendar.emit({
			date,
			from,
			to,
		});
	}

	nextMonth(): void {
		this._changeMonth(1);
	}

	previousMonth(): void {
		this._changeMonth(-1);
	}

	selectDate(dayObj: DayDate): void {
		this.userSelectedDate.set(dayObj.date);
	}

	isSelectedDay(dayObj: DayDate): boolean {
		return (
			this._isAlreadyDateSelected(dayObj) ||
			this.isDateSelectedByUser(dayObj)
		);
	}

	isDayDate(day: string | DayDate): day is DayDate {
		return typeof day === 'object' && 'date' in day;
	}

	private _changeMonth(changeMonthBy: -1 | 1): void {
		const currentMonth = this.currentMonth();

		this.currentMonth.set(
			moment(currentMonth).add(changeMonthBy, 'month').toISOString(),
		);

		this._setMonthDaysChunks();
	}

	private _setMonthDaysChunks(): void {
		const mothsDaysChunks =
			this._dateHelperService.getMonthsDaysChunksByDate(
				this.currentMonth(),
			);

		this.mothsDaysChunks.set(mothsDaysChunks);
	}

	private _setUserCalendarDate(): void {
		if (this._isDateEmpty(this.inputDate())) {
			return;
		}

		this.currentMonth.set(
			this._dateHelperService.dateToString(this.inputDate(), DAY_MONTH_FORMAT),
		);

		this.selectedMonth.set(
			this._dateHelperService.dateToString(this.inputDate(), DAY_MONTH_FORMAT),
		);
	}

	private _isAlreadyDateSelected(dayObj: DayDate): boolean {
		return (
			dayObj.day === this.selectedDay() &&
			this._areDatesMatch(dayObj) &&
			!this.userSelectedDate()
		);
	}

	private _isDateEmpty(date: Option<string>): boolean {
		return !date || date === DATE_PLACEHOLDER;
	}

	private isDateSelectedByUser(dayObj: DayDate): boolean {
		return this.userSelectedDate() === dayObj.date;
	}

	private _areDatesMatch(dayObj: DayDate): boolean {
		return (
			dayObj.date ===
			this._dateHelperService.stringToDate(
				this.selectedMonth(),
				YEAR_MOTH_DAY_FORMAT,
			)
		);
	}

	private _extractDay(
		date: Option<string>,
		isChosenDate?: boolean,
	): Option<string> {
		return date
			? this._dateHelperService.extractDayFromDate(date, isChosenDate)
			: null;
	}
}
