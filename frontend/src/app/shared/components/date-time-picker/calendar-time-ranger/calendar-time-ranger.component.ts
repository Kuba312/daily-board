import {
	Component,
	ElementRef,
	inject,
	Injector,
	input,
	InputSignal,
	model,
	OnInit,
	runInInjectionContext,
	Signal,
	viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Option } from '@core/types/basics.types';
import { KeyboardEventService } from '@shared/services/keyboard-events/keyboard-events.service';
import { TIME_MASK_FORMAT } from '@shared/constants/shared-consts.const';
import { NgxMaskDirective } from 'ngx-mask';
import { CalendarTimeRangerFormModel } from './calendar-time-ranger.form-model.component';

@Component({
	selector: 'app-calendar-time-ranger',
	standalone: true,
	imports: [
		MatInputModule,
		MatFormFieldModule,
		ReactiveFormsModule,
		NgxMaskDirective,
		MatIconModule,
	],
	templateUrl: './calendar-time-ranger.component.html',
})
export default class CalendarTimeRangerComponent implements OnInit {
	private readonly _keyboardEventService: KeyboardEventService =
		inject(KeyboardEventService);
	private readonly _injector: Injector = inject(Injector);

	public fromTime: InputSignal<Option<string>> = input<Option<string>>(null);
	public toTime: InputSignal<Option<string>> = model<Option<string>>(null);

	public fromTimeElement: Signal<Option<ElementRef<HTMLElement>>> =
		viewChild<ElementRef<HTMLElement>>('fromInput');
	public toTimeElement: Signal<Option<ElementRef<HTMLElement>>> =
		viewChild<ElementRef<HTMLElement>>('toInput');

	public formModel: Option<CalendarTimeRangerFormModel> = null;

	public readonly TIME_MASK_FORMAT: string = TIME_MASK_FORMAT;

	ngOnInit(): void {
		this._initializeRangeTimeForm();
	}

	changeTimeOnFocusedTimeInputs(
		event: KeyboardEvent,
		controlName: string,
	): void {
		if (
			!this._keyboardEventService.isInputFocused(
				this._getProperHourInputElement(controlName),
			)
		) {
			return;
		}

		this._updateHour(event, controlName);
	}

	private _updateHour(event: KeyboardEvent, controlName: string): void {
		const { code } = event;

		if (this._keyboardEventService.isArrowUpEvent(code)) {
			this._increaseHour(controlName);

			return;
		}

		if (this._keyboardEventService.isArrowDownEvent(code)) {
			this._decreaseHour(controlName);
		}
	}

	private _increaseHour(controlName: string): void {
		this.formModel?.addTime(controlName);
	}

	private _decreaseHour(controlName: string): void {
		this.formModel?.minusTime(controlName);
	}

	private _getProperHourInputElement(
		controlName: string,
	): Option<ElementRef<HTMLElement>> {
		const formModel = this.formModel;
		return formModel && controlName === formModel.FROM_HOUR
			? this.fromTimeElement()
			: this.toTimeElement();
	}

	private _initializeRangeTimeForm(): void {
		runInInjectionContext(this._injector, () => {
			this.formModel = new CalendarTimeRangerFormModel(
				this.fromTime() ?? null,
				this.toTime() ?? null,
			);
		});
	}
}
