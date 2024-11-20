import { HttpErrorResponse } from '@angular/common/http';
import { Primitive } from '@core/types/basics.types';
import { ERROR_CODE_TRANSLATE_KEY } from '@shared/constants/translation-keys.const';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';

export function showGeneralErrorMessage(
	snackBarService: SnackBarService,
	error: HttpErrorResponse,
): void {
	snackBarService.onShowSnackBarError({
		message: ERROR_CODE_TRANSLATE_KEY,
		dynamicMessage: {
			errorCode: error.status,
		},
	});
}

export function showCustomErrorMessage(
	snackBarService: SnackBarService,
	message: string,
	dynamicMessage: Record<string, Primitive>,
	messageDuration?: number,
): void {
	snackBarService.onShowSnackBarError(
		{
			message,
			dynamicMessage,
		},
		messageDuration,
	);
}
