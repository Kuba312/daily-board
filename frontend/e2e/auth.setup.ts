import { test as setup } from '@playwright/test';
import { registerUser, writeAuthStorageState } from './e2e-api';

setup('create authenticated storageState', async ({ request }) => {
	const auth = await registerUser(request, 'e2e-storage-state@example.test');

	await writeAuthStorageState(auth);
});
