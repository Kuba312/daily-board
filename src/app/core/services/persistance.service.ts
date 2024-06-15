import { Injectable } from '@angular/core';
import { Option } from '../types/basics.types';

@Injectable({ providedIn: 'root' })
export class PersistanceService {
	set<T>(key: string, data: T): void {
		try {
			localStorage.setItem(key, JSON.stringify(data));
		} catch (e) {
			console.error('Error saving to local storage', e);
		}
	}

	get<T>(key: string): Option<T> {
		try {
			const localStorageItem = localStorage.getItem(key);

			return localStorageItem ? JSON.parse(localStorageItem) : null;
		} catch (e) {	
			console.error('Error getting from local storage', e);

			return null;
		}
	}
}
