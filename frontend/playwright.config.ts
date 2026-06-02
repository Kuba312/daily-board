import { defineConfig, devices } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4200';
const apiBaseURL = process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://localhost:8080';

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL,
		trace: 'on-first-retry',
	},
	projects: [
		{
			name: 'setup',
			testMatch: /auth\.setup\.ts/,
		},
		{
			name: 'chromium',
			dependencies: ['setup'],
			testIgnore: /auth\.setup\.ts/,
			use: {
				...devices['Desktop Chrome'],
				storageState: authFile,
			},
		},
	],
	webServer: [
		{
			command:
				'cd ../backend/dailyboard-backend && JAVA_HOME=$(/usr/libexec/java_home -v 22) ./mvnw spring-boot:test-run',
			url: `${apiBaseURL}/v3/api-docs`,
			reuseExistingServer: !process.env.CI,
			timeout: 180_000,
		},
		{
			command: 'npm run start -- --host localhost --port 4200',
			url: baseURL,
			reuseExistingServer: !process.env.CI,
			timeout: 120_000,
		},
	],
});
