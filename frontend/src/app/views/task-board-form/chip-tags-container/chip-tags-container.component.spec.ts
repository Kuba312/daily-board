import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import ChipTagsContainerComponent from './chip-tags-container.component';
import { MockComponent } from 'ng-mocks';
import ChipTagComponent from '@shared/components/chip-tag/chip-tag.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ChipTagsContainerComponent', () => {
	let component: ChipTagsContainerComponent;
	let fixture: ComponentFixture<ChipTagsContainerComponent>;
	let el: DebugElement;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				ChipTagsContainerComponent,
				MockComponent(ChipTagComponent),
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(ChipTagsContainerComponent);
				component = fixture.componentInstance;
				el = fixture.debugElement;

				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should render chip tag components if dates are provided', () => {
		const addingDate1 = '12-12-2024, 12:00 - 13:00';
		const addingDate2 = '12-12-2024, 13:00 - 14:00';
		const addingDate3 = '12-12-2024, 15:00 - 16:00';

		fixture.componentRef.setInput('chipTagsDates', [
			addingDate1,
			addingDate2,
			addingDate3,
		]);

		fixture.detectChanges();

		const chipTagComponents = el.queryAll(By.directive(ChipTagComponent));

		expect(chipTagComponents.length).toBe(3);
	});

	it('should not render chip tag components if dates are not provided', () => {
		fixture.componentRef.setInput('chipTagsDates', []);

		fixture.detectChanges();

		const chipTagComponents = el.queryAll(By.directive(ChipTagComponent));

		expect(chipTagComponents.length).toBe(0);
	});
});
