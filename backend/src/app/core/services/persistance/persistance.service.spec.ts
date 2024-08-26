import { TestBed } from '@angular/core/testing';
import { PersistanceService } from './persistance.service';

describe('PersistanceService', () => {
	let service: PersistanceService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(PersistanceService);

		localStorage.clear();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should save data to localStorage', () => {
		const key = 'testKey';
		const data = { test: 'data' };

		spyOn(localStorage, 'setItem');

		service.set(key, data);

		expect(localStorage.setItem).toHaveBeenCalledWith(
			key,
			JSON.stringify(data),
		);
	});

	it('should retrieve data from localStorage', () => {
		const key = 'testKey';
		const data = { test: 'data' };

		localStorage.setItem(key, JSON.stringify(data));

		const result = service.get<typeof data>(key);

		expect(result).toEqual(data);
	});

	it('should return null if key does not exist in localStorage', () => {
		const key = 'nonExistentKey';

		const result = service.get<unknown>(key);

		expect(result).toBeNull();
	});

	it('should handle JSON parse error gracefully', () => {
		const key = 'testKey';

		localStorage.setItem(key, 'invalid JSON');

		spyOn(console, 'error');

		const result = service.get<unknown>(key);

		expect(result).toBeNull();
		expect(console.error).toHaveBeenCalledWith(
			'Error getting from local storage',
			jasmine.any(SyntaxError),
		);
	});

	it('should handle localStorage setItem error gracefully', () => {
		const key = 'testKey';
		const data = { test: 'data' };

		spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
		spyOn(console, 'error');

		service.set(key, data);

		expect(console.error).toHaveBeenCalledWith(
			'Error saving to local storage',
			jasmine.any(Error),
		);
	});
});
