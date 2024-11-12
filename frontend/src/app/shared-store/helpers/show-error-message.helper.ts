import { HttpErrorResponse } from '@angular/common/http';
import { ERROR_CODE_TRANSLATE_KEY } from '@shared/constants/translation-keys.const';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';

export function showErrorMessage(
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
