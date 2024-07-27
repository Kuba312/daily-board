import { Component } from '@angular/core';
import HeaderComponent from '@shared/components/header/header.component';
import { DateDisplayMode } from '@shared/enums/date-display-mode.enum';

@Component({
	selector: 'app-planner',
	standalone: true,
	imports: [HeaderComponent],
	templateUrl: './planner.component.html',
	styleUrl: './planner.component.scss',
})
export default class PlannerComponent {
	readonly DISPLAY_MODE: DateDisplayMode = DateDisplayMode.Weekly;
}
