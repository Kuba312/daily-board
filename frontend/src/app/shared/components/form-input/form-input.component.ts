import {
	Component,
	DestroyRef,
	inject,
	Injector,
	input,
	InputSignal,
	signal,
	WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FloatLabelType, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Nullable, Option } from '@core/types/basics.types';
import { InputType } from '@core/types/dates.types';
import SafeValue from '@shared/pipes/safe-value.pipe';
import { debounceTime, filter } from 'rxjs';
import { FormErrorMessageComponent } from '../form-error-message/form-error-message.component';

@Component({
	standalone: true,
	imports: [
		ReactiveFormsModule,
		SafeValue,
		MatIconModule,
		MatInputModule,
		MatFormFieldModule,
		FormErrorMessageComponent,
	],
	selector: 'app-form-input',
	templateUrl: 'form-input.component.html',
})
export default class FormInputComponent {
	private _injector: Injector = inject(Injector);
	private _dRef: DestroyRef = inject(DestroyRef);

	formGroup: InputSignal<FormGroup> = input.required<FormGroup>();
	controlName: InputSignal<string> = input.required<string>();
	label: InputSignal<Option<string>> = input<Option<string>>();
	labelType: InputSignal<Option<FloatLabelType>> = input<Option<FloatLabelType>>();
	placeholder: InputSignal<Option<string>> = input<Option<string>>();
	width: InputSignal<number> = input<number>(100);
	inputType: InputSignal<InputType> = input<InputType>('text');
	matIcon: InputSignal<Option<string>> = input<Option<string>>(null);
	mask: InputSignal<Option<string>> = input<Option<string>>(null);
	showMaskTyped: InputSignal<Nullable<boolean>> = input<Nullable<boolean>>(null, {
		transform: undefined,
	});
	customErrorMessages: InputSignal<Option<Record<string, string>>> =
		input<Option<Record<string, string>>>(null);

	isShownMaskTyped: WritableSignal<Nullable<boolean>> = signal(null);
	floatLabel: WritableSignal<FloatLabelType> = signal('always');

	ngOnInit(): void {
		this.floatLabel.set(this.isFloatLabel ? 'always' : 'auto');
		this._setShowMaskTypedValue();
	}

	private _setShowMaskTypedValue(): void {
		toObservable(this.showMaskTyped, { injector: this._injector })
			.pipe(
				filter((isShowMaskTyped) => !!isShowMaskTyped),
				debounceTime(100),
				takeUntilDestroyed(this._dRef),
			)
			.subscribe((isShowMaskTyped) => {
				this.isShownMaskTyped.set(isShowMaskTyped);
				this.floatLabel.set('always');
			});
	}

	get isFloatLabel(): boolean { 
		return this.labelType() === 'always';
	}
}
