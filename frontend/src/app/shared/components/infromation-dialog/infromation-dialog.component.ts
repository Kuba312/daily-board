import { Component, inject } from '@angular/core';
import {
	MAT_DIALOG_DATA,
	MatDialogRef,
} from '@angular/material/dialog';
import { DialogInformationConfig } from '@shared/models/dialog-information-config';
import { TranslateModule } from '@ngx-translate/core';
import PrimaryButtonComponent from '../primary-button/primary-button.component';

@Component({
    selector: 'app-information-dialog',
    imports: [
        TranslateModule,
        PrimaryButtonComponent,
    ],
    templateUrl: './information-dialog.component.html',
})
export default class InformationDialogComponent {
	private readonly _dialogRef: MatDialogRef<InformationDialogComponent> =
		inject(MatDialogRef<InformationDialogComponent>);
	public readonly data: DialogInformationConfig =
		inject<DialogInformationConfig>(MAT_DIALOG_DATA);

	public onDialogClose(): void {
		this._dialogRef.close(false);
	}

	public onConfirmDialogClick(): void {
		this._dialogRef.close(true);
	}

	public onNeverShowDialogClick(componentId: string): void {
		this._dialogRef.close(componentId);
	}
}
