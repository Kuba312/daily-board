import { NgClass } from '@angular/common';
import {
	Component,
	computed,
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
import { CalendarDateDetails } from '@shared/models/calendar-date-details';
import { DayDate } from '@shared/models/date-day';
import LocaleDatePipe from '@shared/pipes/locale-date.pipe';
import SafeValue from '@shared/pipes/safe-value.pipe';
import { LocaleDateService } from '@shared/services/locale-date/locale-date.service';
import { TimeValueConnectorService } from '@shared/services/time-value-connector.service';
import { YEAR_MOTH_DAY_FORMAT } from '@shared/shared-consts.const';
import moment from 'moment';
import { NgxMaskDirective } from 'ngx-mask';
import CalendarTimeRangerComponent from '../calendar-time-ranger/calendar-time-ranger.component';

@Component({
	selector: 'app-calendar-weeks-ranger',
	standalone: true,
	imports: [
		FormsModule,
		MatInputModule,
		MatFormFieldModule,
		ReactiveFormsModule,
		TranslateModule,
		MatIconModule,
		LocaleDatePipe,
		SafeValue,
		NgxMaskDirective,
		CalendarTimeRangerComponent,
		NgClass,
	],
	templateUrl: './calendar-weeks-ranger.component.html',
})
export default class CalendarWeeksRangerComponent implements OnInit {
	private readonly _localeDateService: LocaleDateService =
		inject(LocaleDateService);
	private readonly _timeValueConnector: TimeValueConnectorService = inject(
		TimeValueConnectorService,
	);

	public width: InputSignal<number> = input<number>(25);
	public inputDate: InputSignal<Option<string>> = input<Option<string>>(null);
	public fromTime: InputSignal<Option<string>> = input<Option<string>>(null);
	public toTime: InputSignal<Option<string>> = input<Option<string>>(null);

	public onCloseCalendar: OutputEmitterRef<CalendarDateDetails> =
		output<CalendarDateDetails>();

	public readonly DAY_MONTH_FORMAT: string = 'MMMM YYYY';
	public readonly DAYS: string[] = SHORT_NAME_DAYS;

	public currentMonth: WritableSignal<string> = signal(
		this._localeDateService.getCurrentDay(),
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
		this._localeDateService.getCurrentDay(),
	);
	public userSelectedDate: WritableSignal<string> = signal('');

	ngOnInit(): void {
		this._setUserCalendarDate();
		this._setMonthDaysChunks();
	}

	closeCalendar(): void {
		const from = this._timeValueConnector.timeValueFrom() ?? '';
		const to = this._timeValueConnector.timeValueTo() ?? '';
		const date = this.userSelectedDate() ||
		this._localeDateService.stringToDate(this.currentMonth(), YEAR_MOTH_DAY_FORMAT) ||
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
			this._localeDateService.getMonthsDaysChunksByDate(
				this.currentMonth(),
			);

		this.mothsDaysChunks.set(mothsDaysChunks);		
	}

	private _setUserCalendarDate(): void {
		if (!this.inputDate()) {
			return;
		}

		this.currentMonth.set(
			this._localeDateService.dateToString(this.inputDate(), 'DD-MM-YYYY'),
		);
		
		this.selectedMonth.set(
			this._localeDateService.dateToString(this.inputDate(), 'DD-MM-YYYY'),
		);
	}

	private _isAlreadyDateSelected(dayObj: DayDate): boolean {
		return (
			dayObj.day === this.selectedDay() &&
			this._areDatesMatch(dayObj) &&
			!this.userSelectedDate()
		);
	}

	private isDateSelectedByUser(dayObj: DayDate): boolean {
		return this.userSelectedDate() === dayObj.date;
	}

	private _areDatesMatch(dayObj: DayDate): boolean {
		return (
			dayObj.date ===
			this._localeDateService.stringToDate(
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
			? this._localeDateService.extractDayFromDate(date, isChosenDate)
			: null;
	}
}
