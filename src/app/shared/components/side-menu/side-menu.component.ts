import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { RouterHelperService } from '@app/shared/services/router-helper.service';
import { TranslateModule } from '@ngx-translate/core';
import PrimaryButtonComponent from '../primary-button/primary-button.component';

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

	isActive(link: string): boolean {
		return this._routerHelperService.isActive(link);
	}
}
