import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import TileColorComponent from './tile-color.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('TileColorComponent', () => {
	let fixture: ComponentFixture<TileColorComponent>;
	let component: TileColorComponent;
	let el: DebugElement;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [TileColorComponent],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(TileColorComponent);
				component = fixture.componentInstance;
				el = fixture.debugElement;
				fixture.componentRef.setInput('isChosenColor', false);
				fixture.componentRef.setInput('tileColor', 'red');

				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	})

	it('should highlight tile color if it is chosen', () => {
		fixture.componentRef.setInput('isChosenColor', true);

		fixture.detectChanges();

		const tileWrapper = el.query(By.css('.tile-color__wrapper'));

		expect(tileWrapper.nativeElement.classList).toContain('chosen-color')
	})
});
