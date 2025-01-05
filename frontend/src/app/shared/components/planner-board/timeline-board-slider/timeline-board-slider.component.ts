import { Component, input, InputSignal } from '@angular/core';
import { Option } from '@core/types/basics.types';
import { TimelineSliderDetails } from '@shared/models/time-slider-details';

@Component({
	selector: 'app-timeline-board-slider',
	standalone: true,
	imports: [],
	templateUrl: './timeline-board-slider.component.html',
	styles: ':host { display: block; width: 100%; height: 100%; }',
})
export default class TimelineBoardSliderComponent {
	timelineSliderDetails: InputSignal<Option<TimelineSliderDetails>> =
		input.required<Option<TimelineSliderDetails>>();
}
