import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
	MOCK_HTML_ELEMENTS,
	TILE_BOARD_DUTIES_MOCK,
} from 'src/mocks/mock-data';
import PlannerBoardTileDutiesComponent from './planner-board-tile-duties.component';
import SafeValue from '@shared/pipes/safe-value.pipe';
import { AnimationPlannerDirection } from '@shared/enums/animation-planner-direction.enum';

describe('PlannerBoardTileDutiesComponent', () => {
	let fixture: ComponentFixture<PlannerBoardTileDutiesComponent>;
	let component: PlannerBoardTileDutiesComponent;
	let el: DebugElement;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [SafeValue],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(
					PlannerBoardTileDutiesComponent,
				);
				el = fixture.debugElement;
				component = fixture.componentInstance;
				fixture.componentRef.setInput(
					'timelineValuesElements',
					MOCK_HTML_ELEMENTS,
				);
				fixture.componentRef.setInput(
					'dutiesBoard',
					TILE_BOARD_DUTIES_MOCK,
				);
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('duty tile should have proper top property', () => {
		const dutyTileElement = el.query(
			By.css('.planner-board-tile-duty__item'),
		);

		expect(dutyTileElement.nativeElement.style.top).not.toBeNull();
	});

	it('duty tile should have proper height property', () => {
		const dutyTileElement = el.query(
			By.css('.planner-board-tile-duty__item'),
		);

		expect(dutyTileElement.nativeElement.style.height).not.toBeNull();
	});

	it('should set proper duty label on the tile', () => {
		const dutyTileWrapperNameElement = el.query(
			By.css('.planner-board-tile-duty__name-wrapper span'),
		);

		expect(dutyTileWrapperNameElement.nativeElement.innerText).toBe(
			'Matematyka',
		);
	});

	it('should apply right in planner animation', () => {
		fixture.componentRef.setInput(
			'slidePlannerDirection',
			AnimationPlannerDirection.Right,
		);

		fixture.detectChanges();

		const dutyTileElement = el.query(By.css('.planner-board-tile-duty'));

		expect(
			dutyTileElement.nativeElement.classList.contains(
				'animate-slide-in-right',
			),
		).toBe(true);
	});

	it('should apply left in planner animation', () => {
		fixture.componentRef.setInput(
			'slidePlannerDirection',
			AnimationPlannerDirection.Left,
		);

		fixture.detectChanges();

		const dutyTileElement = el.query(By.css('.planner-board-tile-duty'));

		expect(
			dutyTileElement.nativeElement.classList.contains(
				'animate-slide-in-left',
			),
		).toBe(true);
	});

	it('should emit edit duty when edit action is clicked', () => {
		spyOn(component.editDuty, 'emit');

		const editButton = el.query(
			By.css('.planner-board-tile-duty__action:first-child'),
		);
		editButton.triggerEventHandler('click', new MouseEvent('click'));

		expect(component.editDuty.emit).toHaveBeenCalledWith(
			TILE_BOARD_DUTIES_MOCK[0][0],
		);
	});

	it('should emit delete duty when delete action is clicked', () => {
		spyOn(component.deleteDuty, 'emit');

		const deleteButton = el.query(
			By.css('.planner-board-tile-duty__action:last-child'),
		);
		deleteButton.triggerEventHandler('click', new MouseEvent('click'));

		expect(component.deleteDuty.emit).toHaveBeenCalledWith(
			TILE_BOARD_DUTIES_MOCK[0][0],
		);
	});
});
