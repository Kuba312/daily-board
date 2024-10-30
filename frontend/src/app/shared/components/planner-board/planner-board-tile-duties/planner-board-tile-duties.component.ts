import {
	Component,
	ElementRef,
	input,
	InputSignal,
	signal,
	WritableSignal,
} from '@angular/core';
import { Option } from '@core/types/basics.types';
import { BoardTimelineHourHeights } from '@shared/models/board-timeline-hour-heights';
import { DutyTile } from '@shared/models/duty-tile';
import SafeValue from '@shared/pipes/safe-value.pipe';
import { DutyDto } from 'src/api/models';

@Component({
	selector: 'app-planner-board-tile-duties',
	standalone: true,
	imports: [SafeValue],
	templateUrl: './planner-board-tile-duties.component.html',
})
export default class PlannerBoardTileDutiesComponent {

	private readonly HEIGHT_OF_TIME_VALUE: number = 0;
	private readonly TOP_OF_TIME_VALUE: number = 3;

	public timelineValuesElements: InputSignal<
		readonly ElementRef<HTMLElement>[]
	> = input.required<readonly ElementRef<HTMLElement>[]>();
	public dutiesBoard: InputSignal<DutyDto[][]> =
		input.required<DutyDto[][]>();

	public dutyTiles: WritableSignal<DutyTile[][]> = signal([]);

	private _heightOfTimelineParentContainer: Option<number> = null;

	ngAfterViewInit(): void {
		this._adjustDutiesOnTimelineChange();
	}

	private _adjustDutiesOnTimelineChange(): void {
		if (!this.timelineValuesElements().length) {
			return;
		}

		this.dutyTiles.set(this._adjustDutyToBoard());
	}

	private _adjustDutyToBoard(): {
		tile: DutyDto;
		height: Option<string>;
		top: Option<string>;
	}[][] {
		return this.dutiesBoard().map((tiles) =>
			tiles.map((tile) => ({
				tile,
				height: this.calculateHeightOfDutyTile(tile),
				top: this.calculateTopOfDutyTile(tile),
			})),
		);
	}

	private calculateHeightOfDutyTile(tile: DutyDto): Option<string> {
		const { from, to } = tile;

		if (!from || !to) {
			return;
		}

		const offsetHeightOfFromHour = this._getTopOfHour(from);
		const offsetHeightOfToHour = this._getTopOfHour(to);

		const remInPixels = parseFloat(
			getComputedStyle(document.documentElement).fontSize,
		);
		const heightInRem =
			(offsetHeightOfToHour -
				offsetHeightOfFromHour +
				this.HEIGHT_OF_TIME_VALUE) /
			remInPixels;

		return `${heightInRem}rem`;
	}

	private calculateTopOfDutyTile(tile: DutyDto): Option<string> {
		const { from } = tile;

		if (!from) {
			return null;
		}

		const remInPixels = parseFloat(
			getComputedStyle(document.documentElement).fontSize,
		);

		return `${(this._getTopOfHour(from) + this.TOP_OF_TIME_VALUE) / remInPixels}rem`;
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
