import { filter, Observable } from 'rxjs';

function isNotEmpty<T>(value: T): boolean {
	if (value === null || value === undefined) {
		return false;
	}

	if (typeof value === 'string' && value.trim() === '') {
		return false;
	}

	if (Array.isArray(value) && value.length === 0) {
		return false;
	}

	if (typeof value === 'object' && Object.keys(value).length === 0) {
		return false;
	}

	return true;
}

export function notEmpty<T>(): (source: Observable<T>) => Observable<T> {
	return (source: Observable<T>) =>
		source.pipe(filter((value) => isNotEmpty(value)));
}
