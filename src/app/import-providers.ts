import { HttpClient } from '@angular/common/http';
import {
	TranslateLoader,
	TranslateModule,
	TranslateModuleConfig,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ImportProvidersSource } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/naming-convention
function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const provideTranslation = (): TranslateModuleConfig => ({
	defaultLanguage: 'pl-PL',
	loader: {
		provide: TranslateLoader,
		useFactory: HttpLoaderFactory,
		deps: [HttpClient],
	},
});

const appProvidersFrom: ImportProvidersSource[] = [
	TranslateModule.forRoot(provideTranslation()),
];

export default appProvidersFrom;
