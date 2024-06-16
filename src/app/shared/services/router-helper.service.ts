import { Injectable, inject } from '@angular/core';
import { IsActiveMatchOptions, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RouterHelperService {
	private readonly _router: Router = inject(Router);

	isActive(link: string): boolean {
		const options: IsActiveMatchOptions = {
			paths: 'exact',
			queryParams: 'exact',
			fragment: 'ignored',
			matrixParams: 'ignored',
		};

		return this._router.isActive(link, options);
	}
}
