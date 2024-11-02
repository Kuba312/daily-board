import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import PrimaryButtonComponent from '../primary-button/primary-button.component';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';

@Component({
	selector: 'app-side-menu',
	standalone: true,
	imports: [
		RouterModule,
		MatIconModule,
		TranslateModule,
		PrimaryButtonComponent,
	],
	templateUrl: './side-menu.component.html',
	styleUrl: './side-menu.component.scss',
})
export default class SideMenuComponent {
	private readonly _routerHelperService: RouterHelperService =
		inject(RouterHelperService);

	readonly CALENDAR_URL: string = '/calendar';
	readonly PLANNERS_URL: string = '/planners';
	readonly TASKS_URL: string = '/tasks';
	readonly SETTINGS_URL: string = '/settings';

	isActive(link: string): boolean {
		return this._routerHelperService.isActive(link);
	}

	directToTaskCreator(): void {
		this._routerHelperService.directToUrl('/task-board-add');
	}
	
	directToPlannerCreator(): void { 
		this._routerHelperService.directToUrl('/planner-add');
	}

}
