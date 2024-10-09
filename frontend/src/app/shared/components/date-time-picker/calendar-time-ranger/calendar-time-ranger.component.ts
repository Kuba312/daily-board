import {
	Component,
	ElementRef,
	inject,
	Signal,
	viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MatIconModule } from '@angular/material/icon';
import { CalendarTimeRangerFormModel } from './calendar-time-ranger.form-model.component';
import { TIME_MASK_FORMAT } from '@shared/shared-consts.const';
import { Option } from '@app/core/types/basics.types';
import { KeyboardEventService } from '@app/shared/services/keyboard-events/keyboard-events.service';

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
export default class CalendarTimeRangerComponent {
	private readonly _keyboardEventService: KeyboardEventService =
		inject(KeyboardEventService);

	public fromTimeElement: Signal<Option<ElementRef<HTMLElement>>> =
		viewChild<ElementRef<HTMLElement>>('fromInput');
	public toTimeElement: Signal<Option<ElementRef<HTMLElement>>> =
		viewChild<ElementRef<HTMLElement>>('toInput');

	public formModel: CalendarTimeRangerFormModel =
		new CalendarTimeRangerFormModel();

	public readonly TIME_MASK_FORMAT: string = TIME_MASK_FORMAT;

	increaseTimeOnFocusedFromTimeInput(
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
		this.formModel.addTime(controlName);
	}

	private _decreaseHour(controlName: string): void {
		this.formModel.minusTime(controlName);
	}

	private _getProperHourInputElement(
		controlName: string,
	): Option<ElementRef<HTMLElement>> {
		return controlName === this.formModel.FROM_HOUR
			? this.fromTimeElement()
			: this.toTimeElement();
	}
}
