import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TextProcessingService } from '@shared/services/text-processing/text-processing.service';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import PlannerFormComponent from './planner-form.component';
import { IConfig, NGX_MASK_CONFIG, NgxMaskDirective } from 'ngx-mask';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from '@shared/services/dialog/dialog.service';
import { of } from 'rxjs';
import { PlannerDto } from 'src/api/models';

describe('PlannerFormComponent', () => {
	let fixture: ComponentFixture<PlannerFormComponent>;
	let component: PlannerFormComponent;
	let textProcessingServiceSpy: jasmine.SpyObj<TextProcessingService>;
	let mockStore: jasmine.SpyObj<Store>;
	let dialogServiceSpy: jasmine.SpyObj<DialogService>;
	let routePlannerId: string | null;
	let plannerFromStore: PlannerDto | undefined;
	let plannerSignal: WritableSignal<PlannerDto | undefined>;

	const nameControl = 'name';
	const noteControl = 'note';
	const rangeTimeControl = 'rangeTime';
	const isConstantControl = 'isConstant';

	const maskConfig: Partial<IConfig> = {
		validation: false,
	};

	beforeEach(waitForAsync(() => {
		textProcessingServiceSpy = jasmine.createSpyObj(
			'TextProcessingService',
			['extractFromHourFromControl', 'extractToHourFromControl'],
		);
		mockStore = jasmine.createSpyObj('Store', ['dispatch', 'selectSignal']);
		dialogServiceSpy = jasmine.createSpyObj<DialogService>(
			'DialogService',
			['openConfirmationDialog'],
		);
		routePlannerId = null;
		plannerFromStore = undefined;
		plannerSignal = signal(plannerFromStore);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mockStore.selectSignal.and.callFake((): any => plannerSignal);

		TestBed.configureTestingModule({
			imports: [
				PlannerFormComponent,
				TranslateModule.forRoot(),
				NoopAnimationsModule,
				ReactiveFormsModule,
				MatInputModule,
				MatFormFieldModule,
				NgxMaskDirective,
			],
			providers: [
				{
					provide: TextProcessingService,
					useValue: textProcessingServiceSpy,
				},
				{ provide: Store, useValue: mockStore },
				{ provide: DialogService, useValue: dialogServiceSpy },
				{ provide: NGX_MASK_CONFIG, useValue: maskConfig },
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: {
							paramMap: {
								get(): string | null {
									return routePlannerId;
								},
							},
						},
					},
				},
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(PlannerFormComponent);
				component = fixture.componentInstance;
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should form has proper controls', () => {
		expect(
			component.formModel()?.formGroup().get(nameControl),
		).toBeTruthy();
		expect(
			component.formModel()?.formGroup().get(noteControl),
		).toBeTruthy();
		expect(
			component.formModel()?.formGroup().get(rangeTimeControl),
		).toBeTruthy();
		expect(
			component.formModel()?.formGroup().get(isConstantControl),
		).toBeTruthy();
	});

	it('should form has default values on form', () => {
		expect(component.formModel()?.formGroup().get(nameControl)?.value).toBe(
			'',
		);
		expect(component.formModel()?.formGroup().get(noteControl)?.value).toBe(
			'',
		);
		expect(
			component.formModel()?.formGroup().get(rangeTimeControl)?.value,
		).toBe('');
		expect(
			component.formModel()?.formGroup().get(isConstantControl)?.value,
		).toBe(null);
	});

	it('should call toModel method extractFromHourFromControl and extractToHourFromControl', () => {
		component.formModel()?.toModel();
		fixture.detectChanges();

		expect(
			textProcessingServiceSpy.extractFromHourFromControl,
		).toHaveBeenCalled();
		expect(
			textProcessingServiceSpy.extractToHourFromControl,
		).toHaveBeenCalled();
	});

	it('should control rangeTime has error, if user provide invalid value', () => {
		const rangeTime = component
			.formModel()
			?.formGroup()
			.get(rangeTimeControl);

		rangeTime?.setValue('null, 12:0 - 13:00');
		fixture.detectChanges();

		expect(rangeTime?.errors).toBeTruthy();
	});

	it('should control rangeTime has error, if user provide invalid times range', () => {
		const rangeTime = component
			.formModel()
			?.formGroup()
			.get(rangeTimeControl);

		rangeTime?.setValue('null, 12:00 - 11:00');
		fixture.detectChanges();

		expect(rangeTime?.errors).toBeTruthy();
	});

	it('should control rangeTime has error, if user provide invalid time format', () => {
		const rangeTime = component
			.formModel()
			?.formGroup()
			.get(rangeTimeControl);

		rangeTime?.setValue('null, 12:00 - 9:00');
		fixture.detectChanges();

		expect(rangeTime?.errors).toBeTruthy();
	});

	it('should control rangeTime has error, if user provide not full times', () => {
		const rangeTime = component
			.formModel()
			?.formGroup()
			.get(rangeTimeControl);

		rangeTime?.setValue('null, 12:05 - 19:00');
		fixture.detectChanges();

		expect(rangeTime?.errors).toBeTruthy();
	});

	it('should control rangeTime has error, if user too small difference between times', () => {
		const rangeTime = component
			.formModel()
			?.formGroup()
			.get(rangeTimeControl);

		rangeTime?.setValue('null, 12:00 - 13:00');
		fixture.detectChanges();

		expect(rangeTime?.errors).toBeTruthy();
	});

	it('should does not have errors if user provide valid range time', () => {
		const rangeTime = component
			.formModel()
			?.formGroup()
			.get(rangeTimeControl);

		rangeTime?.setValue('null, 07:00 - 22:00');
		fixture.detectChanges();

		expect(rangeTime?.errors).toBeNull();
	}, 500);

	it('should save planner when user click add button', () => {
		component
			.formModel()
			?.formGroup()
			.get(nameControl)
			?.setValue('Grafik szkolny');
		component
			.formModel()
			?.formGroup()
			.get(rangeTimeControl)
			?.setValue('null, 08:00 - 16:00');
		component
			.formModel()
			?.formGroup()
			.get(isConstantControl)
			?.setValue(false);
			component
			.formModel()
			?.formGroup()
			.get(noteControl)
			?.setValue('To jest stały grafik do szkoły ze stałymi lekcjami.');

		textProcessingServiceSpy.extractFromHourFromControl.and.returnValue(
			'08:00',
		);
		textProcessingServiceSpy.extractToHourFromControl.and.returnValue(
			'16:00',
		);

		const planner = component.formModel()?.toModel();

		component.sendForm();
		fixture.detectChanges();

		expect(mockStore.dispatch).toHaveBeenCalledWith(
			jasmine.objectContaining({
				type: '[planner] Save planner',
				...(planner && {
					planner: jasmine.objectContaining(planner),
				}),
			}),
		);
	});

	it('should update planner without confirmation when name and note change only', waitForAsync(() => {
		routePlannerId = 'planner-a';
		plannerFromStore = {
			id: 'planner-a',
			name: 'Original planner',
			note: 'Original note',
			startTime: '08:00',
			endTime: '16:00',
			isConstant: false,
		};
		plannerSignal.set(plannerFromStore);
		mockStore.dispatch.calls.reset();

		fixture = TestBed.createComponent(PlannerFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		component.formModel()?.formGroup().patchValue({
			[nameControl]: 'Updated planner',
			[noteControl]: 'Updated note',
			[rangeTimeControl]: 'null, 08:00 - 16:00',
			[isConstantControl]: false,
		});
		textProcessingServiceSpy.extractFromHourFromControl.and.returnValue(
			'08:00',
		);
		textProcessingServiceSpy.extractToHourFromControl.and.returnValue(
			'16:00',
		);

		component.sendForm();
		fixture.detectChanges();

		expect(dialogServiceSpy.openConfirmationDialog).not.toHaveBeenCalled();
		expect(mockStore.dispatch).toHaveBeenCalledWith(
			jasmine.objectContaining({
				type: '[planner] Update planner',
				id: 'planner-a',
				planner: jasmine.objectContaining({
					name: 'Updated planner',
					note: 'Updated note',
				}),
				shapeChangeConfirmed: false,
			}),
		);
	}));

	it('should confirm shape change and dispatch confirmation flag', waitForAsync(() => {
		routePlannerId = 'planner-a';
		plannerFromStore = {
			id: 'planner-a',
			name: 'Original planner',
			startTime: '08:00',
			endTime: '16:00',
			isConstant: false,
		};
		plannerSignal.set(plannerFromStore);
		dialogServiceSpy.openConfirmationDialog.and.returnValue(of(true));
		mockStore.dispatch.calls.reset();

		fixture = TestBed.createComponent(PlannerFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		component.formModel()?.formGroup().patchValue({
			[nameControl]: 'Original planner',
			[rangeTimeControl]: 'null, 07:00 - 16:00',
			[isConstantControl]: false,
		});
		textProcessingServiceSpy.extractFromHourFromControl.and.returnValue(
			'07:00',
		);
		textProcessingServiceSpy.extractToHourFromControl.and.returnValue(
			'16:00',
		);

		component.sendForm();
		fixture.detectChanges();

		expect(dialogServiceSpy.openConfirmationDialog).toHaveBeenCalled();
		expect(mockStore.dispatch).toHaveBeenCalledWith(
			jasmine.objectContaining({
				type: '[planner] Update planner',
				id: 'planner-a',
				planner: jasmine.objectContaining({
					confirmDutyDeletionOnShapeChange: true,
				}),
				shapeChangeConfirmed: true,
			}),
		);
	}));

	it('should populate edit time when full planner arrives after dashboard planner', waitForAsync(() => {
		routePlannerId = 'planner-a';
		plannerSignal.set({
			id: 'planner-a',
			name: 'Dashboard planner',
			note: 'Dashboard note',
			isConstant: false,
		});
		mockStore.dispatch.calls.reset();

		fixture = TestBed.createComponent(PlannerFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		expect(
			component.formModel()?.formGroup().get(rangeTimeControl)?.value,
		).toBe('');

		plannerSignal.set({
			id: 'planner-a',
			name: 'Dashboard planner',
			note: 'Dashboard note',
			startTime: '08:00',
			endTime: '16:00',
			isConstant: false,
		});
		fixture.detectChanges();

		const timeInputs = fixture.nativeElement.querySelectorAll(
			'.date-range-container--times-range input',
		);

		expect(
			component.formModel()?.formGroup().get(rangeTimeControl)?.value,
		).toBe('null, 08:00 - 16:00');
		expect(timeInputs[0].value).toBe('08:00');
		expect(timeInputs[1].value).toBe('16:00');
	}));
});
