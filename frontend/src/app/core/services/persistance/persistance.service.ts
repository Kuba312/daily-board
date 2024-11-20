import { Injectable } from '@angular/core';
import { Option } from '@core/types/basics.types';

@Injectable({ providedIn: 'root' })
export class PersistenceService {
	public set<T>(key: string, data: T): void {
		try {
			localStorage.setItem(key, JSON.stringify(data));
		} catch (e) {
			console.error('Error saving to local storage', e);
		}
	}

	public get<T>(key: string): Option<T> {
		try {
			const localStorageItem = localStorage.getItem(key);

			return localStorageItem ? JSON.parse(localStorageItem) : null;
		} catch (e) {	
			console.error('Error getting from local storage', e);

			return null;
		}
	}

	public addToStructure<T extends unknown[]>(key: string, data: T): void {
		const alreadyProvidedData = this.get(key);

		if(!alreadyProvidedData) {
			this.set(key, data);

			return;
		}

		if(!Array.isArray(alreadyProvidedData)) {
			return;
		}

		const joinedData = [...alreadyProvidedData, ...data];

		this.set(key, joinedData);
	}
}
