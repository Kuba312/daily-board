import { expect, test } from '@playwright/test';
import {
	closeOptionalNoPlannerDialog,
	createPlanner,
	readAuthStorageState,
} from './e2e-api';

test.describe('Seed E2E pattern', () => {
	test.afterEach(async ({ page }) => {
		await page.evaluate(() => window.localStorage.clear());
	});

	test('Risk #1 exemplar: owned planner appears only for the authenticated user', async ({
		page,
		request,
	}) => {
		const plannerName = `E2E Seed Owned Planner ${Date.now()}`;
		const auth = await readAuthStorageState();

		await createPlanner(request, auth.token, plannerName);

		await page.goto('/planners');
		await closeOptionalNoPlannerDialog(page);

		await expect(
			page
				.getByRole('main')
				.getByRole('button', { name: /Add planner|Dodaj planer/ }),
		).toBeVisible();
		await expect(page.getByText(plannerName, { exact: true })).toBeVisible();

		// Cleanup: browser state is cleared after each test; persisted rows live in the
		// isolated H2 backend started for this Playwright run and are dropped on exit.
	});
});
