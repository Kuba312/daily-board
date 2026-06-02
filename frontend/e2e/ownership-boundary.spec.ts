import { expect, test } from '@playwright/test';
import {
	API_BASE_URL,
	closeOptionalNoPlannerDialog,
	createPlanner,
	registerUser,
	setAuthState,
} from './e2e-api';

test.describe('Risk #1 ownership boundary', () => {
	test.afterEach(async ({ page }) => {
		await page.evaluate(() => window.localStorage.clear());
	});

	test('Risk #1: User B cannot see or fetch User A planner by direct access', async ({
		page,
		request,
	}) => {
		const runId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		const userA = await registerUser(request, `risk1-user-a-${runId}@example.test`);
		const userB = await registerUser(request, `risk1-user-b-${runId}@example.test`);
		const userAPlannerName = `Risk 1 User A Planner ${runId}`;
		const userAPlanner = await createPlanner(
			request,
			userA.token,
			userAPlannerName,
		);

		await setAuthState(page, userB);
		await page.goto('/planners');
		await closeOptionalNoPlannerDialog(page);

		await expect(
			page
				.getByRole('main')
				.getByRole('button', { name: /Add planner|Dodaj planer/ }),
		).toBeVisible();
		await expect(page.getByText(userAPlannerName)).not.toBeVisible();
		await expect(
			page.getByText(
				/No planners created\. Add your first planner!|Brak stworzonych planerów\. Dodaj swój pierwszy planer!/,
			),
		).toBeVisible();

		const directPlannerResponse = await request.get(
			`${API_BASE_URL}/api/v1/planners/${userAPlanner.id}`,
			{
				headers: {
					Authorization: `Bearer ${userB.token}`,
				},
			},
		);

		expect(directPlannerResponse.status()).toBe(404);
		expect(await directPlannerResponse.text()).not.toContain(userAPlannerName);

		// Cleanup: browser state is cleared after each test; persisted rows live in the
		// isolated H2 backend started for this Playwright run and are dropped on exit.
	});
});
