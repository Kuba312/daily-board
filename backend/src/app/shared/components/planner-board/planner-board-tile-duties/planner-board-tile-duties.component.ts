import { Component, ElementRef, input, InputSignal } from '@angular/core';
import { Option } from '@core/types/basics.types';
import { TileBoardDto } from '@models/tile-board-dto';
import { BoardTimelineHourHeights } from '@shared/models/board-timeline-hour-heights';
import { SafeValue } from '@shared/pipes/safe-value.pipe';

@Component({
	selector: 'app-planner-board-tile-duties',
	standalone: true,
	imports: [SafeValue],
	templateUrl: './planner-board-tile-duties.component.html',
})
export default class PlannerBoardTileDutiesComponent {
	timelineValuesElements: InputSignal<readonly ElementRef<HTMLElement>[]> =
		input.required<readonly ElementRef<HTMLElement>[]>();
	dutiesBoard: InputSignal<TileBoardDto[][]> =
		input.required<TileBoardDto[][]>();

	private _heightOfTimelineParentContainer: Option<number> = null;

	calculateHeightOfDutyTile(tile: TileBoardDto): Option<string> {		
		const { from, to } = tile;

		if (!from || !to) {
			return;
		}

		const offsetHeightOfFromHour = this._getTopOfHour(from);
		const offsetHeightOfToHour = this._getTopOfHour(to);

		return `${offsetHeightOfToHour - offsetHeightOfFromHour}px`;
	}

	calculateTopOfDutyTile(tile: TileBoardDto): Option<string> {
		const { from } = tile;

		if (!from) {
			return;
		}

		return `${this._getTopOfHour(from)}px`;
	}

	private _getTopOfHour(hour: string): number {
		const { heightOfHour, heightOfTimelineContainer } =
			this._getTopsOfTimelineContainerAndHour(hour);

		return this._calculateTopOfTileDuty(
			heightOfHour,
			heightOfTimelineContainer,
		);
	}

	private _getTopsOfTimelineContainerAndHour(
		hour: string,
	): BoardTimelineHourHeights {
		const heightOfTimelineContainer =
			this._geTopOfTimelineParentContainer(hour);
		const heightOfHour =
			this.timelineValuesElements().find((timelineValue) =>
				this._isSomeTimelineValueEqualTileHour(timelineValue, hour),
			)?.nativeElement.offsetTop ?? 0;

		return { heightOfHour, heightOfTimelineContainer };
	}

	private _calculateTopOfTileDuty(
		heightOfFromHour: number,
		heightOfTimelineContainer: number,
	): number {
		const relativeTileTop = heightOfFromHour - heightOfTimelineContainer;

		return relativeTileTop > 0 ? relativeTileTop : 0;
	}

	private _geTopOfTimelineParentContainer(hour: string): number {
		if (this._heightOfTimelineParentContainer) {
			return this._heightOfTimelineParentContainer;
		}

		return this._findTopHeightOfTimelineContainer(hour);
	}

	private _findTopHeightOfTimelineContainer(hour: string): number {
		this._heightOfTimelineParentContainer =
			this.timelineValuesElements().find((timelineValue) =>
				this._isSomeTimelineValueEqualTileHour(timelineValue, hour),
			)?.nativeElement.parentElement?.offsetTop ?? 0;

		return this._heightOfTimelineParentContainer;
	}

	private _isSomeTimelineValueEqualTileHour(
		timelineValue: ElementRef<HTMLElement>,
		hour: string,
	): boolean {
		return timelineValue.nativeElement.id === hour;
	}
}
