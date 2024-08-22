import {
	Component,
	HostListener,
	input,
	InputSignal,
	signal,
	WritableSignal,
} from '@angular/core';
import { DayShortcutResponsivePipe } from '@shared/pipes/day-shortcuts.pipe';
import { SafeValue } from '@shared/pipes/safe-value.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'app-planner-board-days-headers',
	standalone: true,
	imports: [DayShortcutResponsivePipe, SafeValue, TranslateModule],
	templateUrl: './planner-board-days-headers.component.html',
})
export default class PlannerBoardDaysHeadersComponent {
	keysTileBoard: InputSignal<string[]> = input.required<string[]>();

	currentInnerWidth: WritableSignal<number> = signal<number>(
		window.innerWidth,
	);

	@HostListener('window:resize', ['$event'])
	onResize(event: Event): void {
		const target = event.target;

		if (!(target instanceof Window)) {
			return;
		}

		this.currentInnerWidth.set(target.innerWidth);
	}
}
