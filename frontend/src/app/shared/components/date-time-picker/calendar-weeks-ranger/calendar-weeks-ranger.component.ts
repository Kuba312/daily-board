import {
	Component,
	inject,
	input,
	InputSignal,
	OnInit,
	output,
	OutputEmitterRef,
	signal,
	WritableSignal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SHORT_NAME_DAYS } from '@app/core/app.consts';
import { Option } from '@app/core/types/basics.types';
import { TranslateModule } from '@ngx-translate/core';
import LocaleDatePipe from '@shared/pipes/locale-date.pipe';
import SafeValue from '@shared/pipes/safe-value.pipe';
import { LocaleDateService } from '@shared/services/locale-date/locale-date.service';
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
	],
	templateUrl: './calendar-weeks-ranger.component.html',
})
export default class CalendarWeeksRangerComponent implements OnInit {
	private readonly _localeDateService: LocaleDateService =
		inject(LocaleDateService);

	public width: InputSignal<number> = input<number>(25);

	public onCloseCalendar: OutputEmitterRef<void> = output<void>();

	public readonly DAY_MONTH_FORMAT: string = 'MMMM YYYY';
	public readonly DAYS: string[] = SHORT_NAME_DAYS;

	public currentMonth: WritableSignal<string> = signal(
		this._localeDateService.getCurrentDay(),
	);
	public nextMonthValue: WritableSignal<Option<string>> =
		signal<Option<string>>(null);
	public mothsDaysChunks: WritableSignal<string[][]> = signal([]);
	public fromHour: WritableSignal<Option<string>> = signal<Option<string>>(null);
	public toHour: WritableSignal<Option<string>> = signal<Option<string>>(null);

	ngOnInit(): void {
		this._setMonthDaysChunks();
	}

	closeCalendar(): void {
		this.onCloseCalendar.emit();
	}

	nextMonth(): void {
		this._changeMonth(1);
	}

	previousMonth(): void {
		this._changeMonth(-1);
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
}
