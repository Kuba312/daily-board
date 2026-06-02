import { APIRequestContext, Page, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export const AUTH_STORAGE_KEY = 'daily-board-auth';
export const AUTH_FILE = 'playwright/.auth/user.json';
export const APP_ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4200';
export const API_BASE_URL =
	process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://localhost:8080';

export type AuthResponse = {
	token: string;
	user: {
		id: string;
		email: string;
	};
};

export type PlannerResponse = {
	id: string;
	name: string;
	note?: string;
	startTime?: string;
	endTime?: string;
	isConstant?: boolean;
};

export function uniqueEmail(prefix: string): string {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
}

export async function registerUser(
	request: APIRequestContext,
	email: string = uniqueEmail('e2e-user'),
): Promise<AuthResponse> {
	const response = await request.post(`${API_BASE_URL}/api/v1/auth/register`, {
		data: {
			email,
			password: 'E2ePassword123!',
		},
	});

	await expect(response, `register ${email}`).toBeOK();

	return response.json() as Promise<AuthResponse>;
}

export async function createPlanner(
	request: APIRequestContext,
	token: string,
	name: string,
): Promise<PlannerResponse> {
	const response = await request.post(`${API_BASE_URL}/api/v1/planners`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		data: {
			name,
			note: `${name} note`,
			startTime: '08:00:00',
			endTime: '16:00:00',
			isConstant: false,
		},
	});

	await expect(response, `create planner ${name}`).toBeOK();

	return response.json() as Promise<PlannerResponse>;
}

export async function readAuthStorageState(): Promise<AuthResponse> {
	const storageState = JSON.parse(await readFile(AUTH_FILE, 'utf8')) as {
		origins: Array<{
			localStorage: Array<{ name: string; value: string }>;
		}>;
	};

	const authEntry = storageState.origins
		.flatMap((origin) => origin.localStorage)
		.find((entry) => entry.name === AUTH_STORAGE_KEY);

	if (!authEntry) {
		throw new Error(`Missing ${AUTH_STORAGE_KEY} in ${AUTH_FILE}`);
	}

	return JSON.parse(authEntry.value) as AuthResponse;
}

export async function setAuthState(page: Page, auth: AuthResponse): Promise<void> {
	await page.context().addInitScript(
		({ key, value }) => {
			window.localStorage.setItem(key, value);
		},
		{
			key: AUTH_STORAGE_KEY,
			value: JSON.stringify(auth),
		},
	);
}

export async function closeOptionalNoPlannerDialog(page: Page): Promise<void> {
	const closeButton = page.getByRole('button', { name: /^(Close|Zamknij)$/ });

	if (await closeButton.isVisible().catch(() => false)) {
		await closeButton.click();
	}
}

export async function writeAuthStorageState(auth: AuthResponse): Promise<void> {
	await mkdir(dirname(AUTH_FILE), { recursive: true });
	await writeFile(
		AUTH_FILE,
		JSON.stringify(
			{
				cookies: [],
				origins: [
					{
						origin: APP_ORIGIN,
						localStorage: [
							{
								name: AUTH_STORAGE_KEY,
								value: JSON.stringify(auth),
							},
						],
					},
				],
			},
			null,
			2,
		),
	);
}
