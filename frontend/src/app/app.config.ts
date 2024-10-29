import {
	ApplicationConfig,
	importProvidersFrom,
	isDevMode,
	provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import routes from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import appProvidersFrom from './import-providers';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { SnackBarService } from './shared/services/snackbar-service/snack-bar.service';

export const appConfig: ApplicationConfig = {
	providers: [
		provideExperimentalZonelessChangeDetection(),
		provideRouter(routes, withViewTransitions()),
		provideHttpClient(withFetch()),
		provideStore(),
		provideStoreDevtools({
			maxAge: 25,
			logOnly: !isDevMode(),
			autoPause: true,
			trace: false,
			traceLimit: 75,
		}),
		provideAnimationsAsync(),
		importProvidersFrom(appProvidersFrom),
		provideEnvironmentNgxMask(),
		SnackBarService,
	],
};
