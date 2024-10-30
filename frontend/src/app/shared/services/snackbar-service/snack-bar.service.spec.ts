import { TestBed, waitForAsync } from '@angular/core/testing';
import { SnackBarService } from './snack-bar.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarMessage } from '@shared/models/snack-bar-message';

describe('SnackBarService', () => {
	let snackBarService: SnackBarService;
	let matSnackBar: MatSnackBar;
	let translateService: TranslateService;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot()],
			providers: [
				SnackBarService,
				{
					provide: MatSnackBar,
					useValue: {
						open: jasmine.createSpy('open'),
					},
				},
			],
		})
			.compileComponents()
			.then(() => {
				snackBarService = TestBed.inject(SnackBarService);
				snackBarService = TestBed.inject(SnackBarService);
				matSnackBar = TestBed.inject(MatSnackBar);
				translateService = TestBed.inject(TranslateService);
				spyOn(translateService, 'instant').and.callFake((key) => key);
			});
	}));

	it('should create the service', () => {
		expect(snackBarService).toBeTruthy();
	});

	it('should show a success snackbar with translated message', () => {
		const message: SnackBarMessage = {
			message: 'snack.success',
			dynamicMessage: { name: 'Test' },
		};
		const duration = 3000;

		snackBarService.onShowSnackBarSuccess(message, duration);

		expect(translateService.instant).toHaveBeenCalledWith(
			message.message,
			message.dynamicMessage,
		);
		expect(matSnackBar.open).toHaveBeenCalledWith(message.message, 'X', {
			duration: duration,
			horizontalPosition: 'center',
			verticalPosition: 'bottom',
			panelClass: 'snack-bar-success',
		});
	});

	it('should show an error snackbar with translated message', () => {
		const message: SnackBarMessage = {
			message: 'snack.error',
			dynamicMessage: { errorCode: '404' },
		};
		const duration = 3000;

		snackBarService.onShowSnackBarError(message, duration);

		expect(translateService.instant).toHaveBeenCalledWith(
			message.message,
			message.dynamicMessage,
		);
		expect(matSnackBar.open).toHaveBeenCalledWith(message.message, 'X', {
			duration: duration,
			horizontalPosition: 'center',
			verticalPosition: 'bottom',
			panelClass: 'snack-bar-error',
		});
	});

	it('should configure and display the snackbar with dynamic message if provided', () => {
		const snackBarMessage: SnackBarMessage = {
			message: 'snack.dynamic',
			dynamicMessage: { item: 'Data' },
		};
		const duration = 5000;
		const panelClass = 'snack-bar-custom';

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(snackBarService as any)._snackBarConfig(
			snackBarMessage,
			duration,
			panelClass,
		);

		expect(translateService.instant).toHaveBeenCalledWith(
			snackBarMessage.message,
			snackBarMessage.dynamicMessage,
		);
		expect(matSnackBar.open).toHaveBeenCalledWith(
			snackBarMessage.message,
			'X',
			{
				duration: duration,
				horizontalPosition: 'center',
				verticalPosition: 'bottom',
				panelClass: panelClass,
			},
		);
	});

	it('should configure and display the snackbar without dynamic message if not provided', () => {
		const snackBarMessage: SnackBarMessage = {
			message: 'snack.static',
		};
		const duration = 4000;
		const panelClass = 'snack-bar-static';

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(snackBarService as any)._snackBarConfig(
			snackBarMessage,
			duration,
			panelClass,
		);

		expect(translateService.instant).toHaveBeenCalledWith(
			snackBarMessage.message,
			undefined,
		);
		expect(matSnackBar.open).toHaveBeenCalledWith(
			snackBarMessage.message,
			'X',
			{
				duration: duration,
				horizontalPosition: 'center',
				verticalPosition: 'bottom',
				panelClass: panelClass,
			},
		);
	});
});
