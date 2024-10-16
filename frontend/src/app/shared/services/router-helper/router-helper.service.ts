import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, IsActiveMatchOptions, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RouterHelperService {
	private readonly _router: Router = inject(Router);
	private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);

	isActive(link: string): boolean {
		const options: IsActiveMatchOptions = {
			paths: 'exact',
			queryParams: 'exact',
			fragment: 'ignored',
			matrixParams: 'ignored',
		};

		return this._router.isActive(link, options);
	}

	directToUrl(url: string, relativeToCurrentPath?: boolean): void {
		this._router.navigate(
			[url],
			relativeToCurrentPath ? { relativeTo: this._activatedRoute } : {},
		);
	}
}
