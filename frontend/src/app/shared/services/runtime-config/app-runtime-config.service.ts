import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface AppRuntimeConfig {
	apiBaseUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AppRuntimeConfigService {
	private readonly httpClient: HttpClient = inject(HttpClient);
	
	private config?: AppRuntimeConfig;

	async load(): Promise<void> {
		if (this.config) {
			return;
		}

		try {
			const loaded = await firstValueFrom(
				this.httpClient.get<AppRuntimeConfig>('/assets/app-config.json'),
			);
			this.config = loaded;
		} catch {
			this.config = { apiBaseUrl: 'http://localhost:8080' };
		}
	}

	get apiBaseUrl(): string {
		if (!this.config) {
			throw new Error(
				'Runtime config was not loaded. Ensure APP_INITIALIZER loads AppRuntimeConfigService before app start.',
			);
		}

		return this.config.apiBaseUrl;
	}
}
