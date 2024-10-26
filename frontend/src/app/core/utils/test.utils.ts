import { DebugElement } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ButtonClickEvents = {
	left: { button: 0 },
	right: { button: 2 },
};

type ButtonClickEventsType = typeof ButtonClickEvents;

export function click(
	el: DebugElement | HTMLElement,
	eventObj: ButtonClickEventsType[keyof ButtonClickEventsType] = ButtonClickEvents.left,
): void {
	if (el instanceof HTMLElement) {
		el.click();
	} else {
		el.triggerEventHandler('click', eventObj);
	}
}
