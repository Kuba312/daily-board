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

	directToUrl(
		url: string,
		params?: string[],
		relativeToCurrentPath?: boolean,
	): void {
		const pathSegments = [url, ...(params ? [...params] : [])];

		this._router.navigate(
			pathSegments,
			relativeToCurrentPath ? { relativeTo: this._activatedRoute } : {},
		);
	}
}
