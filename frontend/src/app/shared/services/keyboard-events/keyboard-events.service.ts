import { ElementRef, Injectable } from '@angular/core';
import { Option } from '@core/types/basics.types';

@Injectable({ providedIn: 'root' })
export class KeyboardEventService {
	private readonly ARROW_UP_EVENT: string = 'ArrowUp';
	private readonly ARROW_DOWN_EVENT: string = 'ArrowDown';

	public isInputFocused(
		inputElement: Option<ElementRef<HTMLElement>>,
	): boolean {
		return !!inputElement?.nativeElement.focus;
	}

	public isArrowUpEvent(code: string): boolean {
		return code === this.ARROW_UP_EVENT;
	}

	public isArrowDownEvent(code: string): boolean {
		return code === this.ARROW_DOWN_EVENT;
	}
}
