import { DebugElement } from '@angular/core';
import TimelineBoardSliderComponent from './timeline-board-slider.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

describe('TimelineBoardSliderComponent', () => {
	let fixture: ComponentFixture<TimelineBoardSliderComponent>;
	let component: TimelineBoardSliderComponent;
	let el: DebugElement;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [TimelineBoardSliderComponent],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(TimelineBoardSliderComponent);
				el = fixture.debugElement;
				component = fixture.componentInstance;
				fixture.componentRef.setInput('timelineSliderDetails', {
					currentTime: '10:00',
					timeTopPosition: 30.1,
				});
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display time slider indicator', () => {
		const timeSliderIndicator = el.query(By.css('.timeline-board-slider__indicator'));

		expect(timeSliderIndicator).toBeTruthy();
	});

	it('should set proper height of slider indicator', () => {
		const timeSliderIndicator = el.query(By.css('.timeline-board-slider__indicator'));

		expect(timeSliderIndicator.nativeElement.style.top).toBe('30.1rem');
	});

	it('should set display current time in slider indicator', () => {
		const timeSliderIndicator = el.query(By.css('.timeline-board-slider__indicator'));
		
		expect(timeSliderIndicator.nativeElement.innerText).toBe('10:00');
	})
})