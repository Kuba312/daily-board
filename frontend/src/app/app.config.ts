import {
	ApplicationConfig,
	APP_INITIALIZER,
	importProvidersFrom,
	isDevMode,
	provideZonelessChangeDetection,
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
import { ApiConfiguration } from 'src/api/api-configuration';
import { AppRuntimeConfigService } from './shared/services/runtime-config/app-runtime-config.service';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZonelessChangeDetection(),
		provideRouter(routes, withViewTransitions()),
		provideHttpClient(withFetch()),
		{
			provide: APP_INITIALIZER,
			multi: true,
			deps: [AppRuntimeConfigService],
			useFactory: (runtimeConfig: AppRuntimeConfigService) => () => runtimeConfig.load(),
		},
		{
			provide: ApiConfiguration,
			deps: [AppRuntimeConfigService],
			useFactory: (runtimeConfig: AppRuntimeConfigService) => {
				const config = new ApiConfiguration();
				config.rootUrl = runtimeConfig.apiBaseUrl;
				return config;
			},
		},
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
