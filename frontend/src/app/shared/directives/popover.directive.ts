import {
	ChangeDetectorRef,
	Directive,
	ElementRef,
	inject,
	input,
	InputSignal,
	Renderer2,
	signal,
	WritableSignal,
} from '@angular/core';
import { Option } from '@core/types/basics.types';
import { PopoverPosition } from '../enums/popover-positon.enum';

@Directive({
	selector: '[appPopover]',
	standalone: true,
})
export class PopoverDirective {
	private readonly _element: ElementRef = inject(ElementRef);
	private readonly _renderer: Renderer2 = inject(Renderer2);
	private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

	public aboveContent: InputSignal<Option<string>> =
		input<Option<string>>(null);
	public mainContent: InputSignal<Option<string | string[]>> =
		input<Option<string | string[]>>(null);
	public position: InputSignal<Option<PopoverPosition>> =
		input<Option<PopoverPosition>>(null);

	private tooltipElement: WritableSignal<Option<HTMLDivElement>> =
		signal(null);

	ngOnInit(): void {
		this._listenToEvents();
	}

	private _listenToEvents(): void {
		this._renderer.listen(this._element.nativeElement, 'mouseenter', () => {
			this._onMouseEnter();
		});

		this._renderer.listen(this._element.nativeElement, 'mouseleave', () => {
			this._onMouseLeave();
		});
	}

	private _onMouseEnter(): void {
		if (!this.mainContent() || !this.mainContent()?.length) {
			return;
		}

		this._setHostPosition();
		this._createTooltip();
		this._updateTooltipPosition();
		this._setTooltipDynamicContent();
	}

	private _onMouseLeave(): void {
		this._destroyTooltip();
	}

	private _destroyTooltip(): void {
		const tooltipElement = this.tooltipElement();

		if (tooltipElement) {
			this._renderer.removeChild(document.body, tooltipElement);
			this.tooltipElement.set(null);

			this._cdr.markForCheck();
		}
	}

	private _setTooltipDynamicContent(): void {
		const dynamicContent = this.mainContent();
		const staticContent = this.aboveContent();

		const adjustedContent = this._adjustTooltipContent(
			staticContent,
			dynamicContent,
		);
		const tooltipElement = this.tooltipElement();

		if (!tooltipElement) {
			return;
		}

		const textContainer = tooltipElement.querySelector('p');

		if (textContainer) {
			this._renderer.setProperty(
				textContainer,
				'textContent',
				adjustedContent,
			);
		}
	}

	private _setHostPosition(): void {
		const position = getComputedStyle(this._element.nativeElement).position;

		if (position === 'static' || !position) {
			this._renderer.setStyle(
				this._element.nativeElement,
				'position',
				'relative',
			);
		}
	}

	private _createTooltip(): void {
		if (this.tooltipElement()) {
			return;
		}

		const tooltip = this._renderer.createElement('div');
		const textContainer = this._renderer.createElement('p');

		this._setStylesToTooltip(tooltip);

		this._renderer.appendChild(tooltip, textContainer);
		this._renderer.appendChild(document.body, tooltip);

		this.tooltipElement.set(tooltip);

		requestAnimationFrame(() => {
			this._renderer.setStyle(tooltip, 'opacity', '1');
			this._renderer.setStyle(tooltip, 'transform', 'scale(1)');
		});
	}

	private _setStylesToTooltip(tooltip: HTMLDivElement): void {
		this._renderer.addClass(tooltip, 'tooltip');
		this._renderer.setStyle(tooltip, 'position', 'absolute');
		this._renderer.setStyle(tooltip, 'z-index', '1000');
		this._renderer.setStyle(
			tooltip,
			'background-color',
			'var(--color-background-secondary)',
		);
		this._renderer.setStyle(tooltip, 'border-radius', '9px');
		this._renderer.setStyle(tooltip, 'font-size', '1.2rem');
		this._renderer.setStyle(
			tooltip,
			'color',
			'var(--color-text-secondary)',
		);
		this._renderer.setStyle(tooltip, 'padding', '1rem 0.8rem');
		this._renderer.setStyle(tooltip, 'opacity', '0');
		this._renderer.setStyle(tooltip, 'transform', 'scale(0.9)');
		this._renderer.setStyle(
			tooltip,
			'transition',
			'opacity 0.3s ease, transform 0.3s ease',
		);
		this._renderer.setStyle(tooltip, 'max-width', '16rem');
		this._renderer.setStyle(tooltip, 'word-wrap', 'break-word');
		this._renderer.setStyle(tooltip, 'white-space', 'normal');
		this._renderer.setStyle(tooltip, 'display', 'flex');
		this._renderer.setStyle(tooltip, 'flex-wrap', 'wrap');
		this._renderer.setStyle(
			tooltip,
			'box-shadow',
			'var(--color-border) 0px 13px 27px -5px, #0000004d 0px 8px 16px -8px',
		);
	}

	private _updateTooltipPosition(): void {
		const hostElement = this._element.nativeElement;
		const tooltipElement = this.tooltipElement();

		if (!tooltipElement) {
			return;
		}

		const marginRem = 1;
		const marginPx =
			marginRem *
			parseFloat(getComputedStyle(document.documentElement).fontSize);

		const hostRect: DOMRect = hostElement.getBoundingClientRect();
		const position = this.position() ?? PopoverPosition.Above;

		const scrollTop = window.scrollY || document.documentElement.scrollTop;
		const scrollLeft =
			window.scrollX || document.documentElement.scrollLeft;

		this._setTooltipPosition(
			position,
			tooltipElement,
			hostRect,
			scrollTop,
			marginPx,
			scrollLeft,
		);
	}

	private _setTooltipPosition(
		position: PopoverPosition,
		tooltipElement: HTMLDivElement,
		hostRect: DOMRect,
		scrollTop: number,
		marginPx: number,
		scrollLeft: number,
	): void {
		switch (position) {
			case PopoverPosition.Above:
				this._setAbovePosition(
					tooltipElement,
					hostRect,
					scrollTop,
					marginPx,
					scrollLeft,
				);
				break;

			case PopoverPosition.Below:
				this._setBelowPosition(
					tooltipElement,
					hostRect,
					scrollTop,
					marginPx,
					scrollLeft,
				);
				break;

			case PopoverPosition.Left:
				this._setLeftPosition(
					tooltipElement,
					hostRect,
					scrollTop,
					marginPx,
					scrollLeft,
				);
				break;

			case PopoverPosition.Right:
				this._setRightPosition(
					tooltipElement,
					hostRect,
					scrollTop,
					marginPx,
					scrollLeft,
				);
				break;

			default:
				this._setAbovePosition(
					tooltipElement,
					hostRect,
					scrollTop,
					marginPx,
					scrollLeft,
				);
				break;
		}
	}

	private _setAbovePosition(
		tooltipElement: HTMLDivElement,
		hostRect: DOMRect,
		scrollTop: number,
		marginPx: number,
		scrollLeft: number,
	): void {
		this._renderer.setStyle(
			tooltipElement,
			'top',
			`${
				hostRect.top +
				scrollTop -
				tooltipElement.offsetHeight -
				marginPx
			}px`,
		);
		this._renderer.setStyle(
			tooltipElement,
			'left',
			`${
				hostRect.left +
				scrollLeft +
				(hostRect.width - tooltipElement.offsetWidth) / 2
			}px`,
		);
	}

	private _setBelowPosition(
		tooltipElement: HTMLDivElement,
		hostRect: DOMRect,
		scrollTop: number,
		marginPx: number,
		scrollLeft: number,
	): void {
		this._renderer.setStyle(
			tooltipElement,
			'top',
			`${hostRect.bottom + scrollTop + marginPx}px`,
		);
		this._renderer.setStyle(
			tooltipElement,
			'left',
			`${
				hostRect.left +
				scrollLeft +
				(hostRect.width - tooltipElement.offsetWidth) / 2
			}px`,
		);
	}

	private _setLeftPosition(
		tooltipElement: HTMLDivElement,
		hostRect: DOMRect,
		scrollTop: number,
		marginPx: number,
		scrollLeft: number,
	): void {
		this._renderer.setStyle(
			tooltipElement,
			'top',
			`${
				hostRect.top +
				scrollTop +
				(hostRect.height - tooltipElement.offsetHeight) / 2
			}px`,
		);
		this._renderer.setStyle(
			tooltipElement,
			'left',
			`${
				hostRect.left +
				scrollLeft -
				tooltipElement.offsetWidth -
				marginPx
			}px`,
		);
	}

	private _setRightPosition(
		tooltipElement: HTMLDivElement,
		hostRect: DOMRect,
		scrollTop: number,
		marginPx: number,
		scrollLeft: number,
	): void {
		this._renderer.setStyle(
			tooltipElement,
			'top',
			`${
				hostRect.top +
				scrollTop +
				(hostRect.height - tooltipElement.offsetHeight) / 2
			}px`,
		);
		this._renderer.setStyle(
			tooltipElement,
			'left',
			`${hostRect.right + scrollLeft + marginPx}px`,
		);
	}

	private _adjustTooltipContent(
		staticContent: Option<string>,
		dynamicContent: Option<string | string[]>,
	): string {
		if (!staticContent && !dynamicContent) {
			return '';
		}

		const dynamicContentString = Array.isArray(dynamicContent)
			? dynamicContent.join(', ')
			: dynamicContent;

		return `${staticContent ? `${staticContent} ` : ''}${
			dynamicContentString ? `${dynamicContentString}` : ''
		}`;
	}
}
