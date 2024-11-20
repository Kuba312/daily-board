import { ComponentType } from '@angular/cdk/portal';
import { DestroyRef, inject, Injectable, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DIALOGS_TO_NOT_SHOW as DIALOGS_TO_NOT_SHOW } from '@core/app.consts';
import { PersistenceService } from '@core/services/persistance/persistance.service';
import { notEmpty } from '@core/helpers/not-empty-operator.helper';
import { NgDialogAnimationService } from 'ng-dialog-animation';

@Injectable({ providedIn: 'root' })
export class DialogService {
	private readonly _dialog: NgDialogAnimationService = inject(
		NgDialogAnimationService,
	);
	private readonly _persistenceService: PersistenceService =
		inject(PersistenceService);

	public openSimpleDialog(
		destroyRef: DestroyRef,
		component: ComponentType<unknown> | TemplateRef<unknown>,
		componentId: string,
	): void {
		const dialogProvidedToNotShowAgain =
			this._persistenceService.get(DIALOGS_TO_NOT_SHOW);

		if (
			this._dialogIsMarkedAsNotShownAgain(
				dialogProvidedToNotShowAgain,
				componentId,
			)
		) {
			return;
		}

		const dialogRef = this._dialog.open(component, {
			data: {
				message: 'information-dialog.no-planner-to-chose',
				componentId,
			},
			disableClose: true,
			animation: {
				to: 'bottom',
			},
			width: '50rem',
			height: '20rem',
			position: { top: '10rem' },
		});

		dialogRef
			.afterClosed()
			.pipe(notEmpty(), takeUntilDestroyed(destroyRef))
			.subscribe((result) => {
				if (typeof result !== 'string') {
					return;
				}

				this._persistenceService.addToStructure(DIALOGS_TO_NOT_SHOW, [
					result,
				]);
			});
	}

	private _dialogIsMarkedAsNotShownAgain(
		dialogProvidedToNotShowAgain: unknown,
		componentId: string,
	): boolean {
		return (
			Array.isArray(dialogProvidedToNotShowAgain) &&
			!!dialogProvidedToNotShowAgain.length &&
			dialogProvidedToNotShowAgain.some(
				(providedComponentId) => providedComponentId === componentId,
			)
		);
	}
}
