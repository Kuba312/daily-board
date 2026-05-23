import { NgClass } from '@angular/common';
import {
	Component,
	DestroyRef,
	inject,
	input,
	InputSignal,
	NgZone,
	OnInit,
	output,
	OutputEmitterRef,
	signal,
	WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { DateHelperService } from '@shared/services/locale-date/date-helper.service';
import { TranslateModule } from '@ngx-translate/core';
import { DayShortcutResponsivePipe } from '@shared/pipes/day-shortcuts.pipe';
import { fromEvent } from 'rxjs';
import { PeriodWeek } from '@shared/models/period-week';
import { WeekBoundary } from '@shared/types/week-range.type';

@Component({
    selector: 'app-planner-board-days-headers',
    imports: [DayShortcutResponsivePipe, TranslateModule, MatIcon, NgClass],
    templateUrl: './planner-board-days-headers.component.html'
})
export default class PlannerBoardDaysHeadersComponent implements OnInit {
	private readonly _ngZone: NgZone = inject(NgZone);
	private readonly _destroyRef: DestroyRef = inject(DestroyRef);
	private readonly _dateHelperService: DateHelperService =
		inject(DateHelperService);

	public keysTileBoard: InputSignal<string[]> = input.required<string[]>();
	public isDynamic: InputSignal<boolean> = input.required<boolean>();

	public changedWeekPeriod: OutputEmitterRef<PeriodWeek> =
		output<PeriodWeek>();

	public currentWeekIndex: WritableSignal<number> = signal<number>(0);
	public currentInnerWidth: WritableSignal<number> = signal<number>(
		window.innerWidth,
	);

	public ngOnInit(): void {
		this._listenToScreenResize();
	}

	public onWeekPeriodChanged(isBackWeek: boolean): void {
		const changedPeriod = this._updateWeekPeriod(isBackWeek);

		this._emitWeekPeriod(changedPeriod);
	}

	private _emitWeekPeriod(changedPeriod: WeekBoundary): void {
		this.changedWeekPeriod.emit({
			weekPeriod: changedPeriod,
			currentWeekIndex: this.currentWeekIndex(),
		});
	}

	private _updateWeekPeriod(isBackWeek: boolean): WeekBoundary {
		this.currentWeekIndex.update((index) =>
			isBackWeek ? index - 1 : index + 1,
		);

		return this._dateHelperService.changeWeekPeriod(
			this.currentWeekIndex(),
		);
	}

	private _listenToScreenResize(): void {
		this._ngZone.runOutsideAngular(() => {
			fromEvent(window, 'resize')
				.pipe(takeUntilDestroyed(this._destroyRef))
				.subscribe((event) => {
					const target = event.target;

					if (!(target instanceof Window)) {
						return;
					}

					this.currentInnerWidth.set(target.innerWidth);
				});
		});
	}
}
