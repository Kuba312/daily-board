import { CreateEffectOptions, Injector } from '@angular/core';

export function configEffect(
	injector: Injector,
	allowSignalWrites: boolean = false,
): CreateEffectOptions {
	return {
		injector,
		allowSignalWrites,
	};
}
