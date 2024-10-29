import { Injectable, inject } from '@angular/core';
import {
	MatSnackBar,
	MatSnackBarHorizontalPosition,
	MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { SnackBarMessage } from '@shared/models/snack-bar-message';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class SnackBarService {
	private readonly _translateService: TranslateService =
		inject(TranslateService);
	private readonly _matSnackBar: MatSnackBar = inject(MatSnackBar);

	private readonly HORIZONTAL_POSITION: MatSnackBarHorizontalPosition =
		'center';
	private readonly VERTICAL_POSITION: MatSnackBarVerticalPosition = 'bottom';

	private readonly SNACK_BAR_SUCCESS: string = 'snack-bar-success';
	private readonly SNACK_BAR_ERROR: string = 'snack-bar-error';

	onShowSnackBarSuccess(
		message: SnackBarMessage,
		duration: number = 3000,
	): void {
		this._snackBarConfig(message, duration, this.SNACK_BAR_SUCCESS);
	}

	onShowSnackBarError(
		message: SnackBarMessage,
		duration: number = 3000,
	): void {
		this._snackBarConfig(message, duration, this.SNACK_BAR_ERROR);
	}

	private _snackBarConfig(
		snackBarMessage: SnackBarMessage,
		duration: number,
		panelClass: string,
	): void {
		this._matSnackBar.open(
			this._translateService.instant(
				snackBarMessage.message,
				snackBarMessage.dynamicMessage
					? { ...snackBarMessage.dynamicMessage }
					: undefined,
			),
			'X',
			{
				duration,
				horizontalPosition: this.HORIZONTAL_POSITION,
				verticalPosition: this.VERTICAL_POSITION,
				panelClass,
			},
		);
	}
}
