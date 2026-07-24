import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import PrimaryButtonComponent from '../primary-button/primary-button.component';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { AuthService } from '@core/auth/auth.service';
import { Store } from '@ngrx/store';
import { plannerActions } from '@shared-store/planner-store/planner.actions';
import { dutyActions } from '@shared-store/duty-store/duty.actions';

@Component({
    selector: 'app-side-menu',
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
	private readonly _authService: AuthService = inject(AuthService);
	private readonly _store: Store = inject(Store);

	readonly PLANNERS_URL: string = '/planners';

	public isActive(link: string): boolean {
		return this._routerHelperService.isActive(link);
	}

	public isAuthenticated(): boolean {
		return this._authService.isAuthenticated();
	}

	public directToTaskPlannerChooser(): void {
		this._routerHelperService.directToUrl('/choose-planner');
	}
	
	public directToPlannerCreator(): void { 
		this._routerHelperService.directToUrl('/planner-add');
	}

	public logout(): void {
		this._store.dispatch(plannerActions.resetPlanners());
		this._store.dispatch(dutyActions.resetDuties());
		this._authService.logout();
		this._routerHelperService.directToUrl('/auth');
	}
}
