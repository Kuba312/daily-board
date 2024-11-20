import {
	Component,
	DestroyRef,
	inject,
	input,
	InputSignal,
	NgZone,
	OnInit,
	signal,
	WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { DayShortcutResponsivePipe } from '@shared/pipes/day-shortcuts.pipe';
import { fromEvent } from 'rxjs';

@Component({
	selector: 'app-planner-board-days-headers',
	standalone: true,
	imports: [DayShortcutResponsivePipe, TranslateModule],
	templateUrl: './planner-board-days-headers.component.html',
})
export default class PlannerBoardDaysHeadersComponent implements OnInit {
	private readonly _ngZone: NgZone = inject(NgZone);
	private readonly _destroyRef: DestroyRef = inject(DestroyRef);

	public keysTileBoard: InputSignal<string[]> = input.required<string[]>();

	public currentInnerWidth: WritableSignal<number> = signal<number>(
		window.innerWidth,
	);

	ngOnInit(): void {
		this._listenToScreenResize();
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
