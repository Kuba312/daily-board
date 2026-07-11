import { signal } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { DutyHelperService } from '@shared/services/duty-helper/duty-helper.service';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { RouterHelperService } from '@shared/services/router-helper/router-helper.service';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { TextProcessingService } from '@shared/services/text-processing/text-processing.service';
import { PlannerType } from '@shared/enums/planner-type.enum';
import { dutyActions } from '@shared-store/duty-store/duty.actions';
import { IConfig, NGX_MASK_CONFIG, NgxMaskDirective } from 'ngx-mask';
import { DUTY_MOCK, MOCK_PLANNERS } from 'src/mocks/mock-data';
import { DutyDto } from 'src/api/models';
import { TaskBoardFormModel } from './task-board-form.form-model';
import TaskBoardFormComponent from './task-board-form.component';

describe('TaskBoardFormComponent', () => {
	let fixture: ComponentFixture<TaskBoardFormComponent>;
	let component: TaskBoardFormComponent;
	let textProcessingServiceSpy: jasmine.SpyObj<TextProcessingService>;
	let dutyHelperServiceSpy: jasmine.SpyObj<DutyHelperService>;
	let routerHelperServiceSpy: jasmine.SpyObj<RouterHelperService>;
	let snackBarServiceSpy: jasmine.SpyObj<SnackBarService>;
	let mockStore: jasmine.SpyObj<Store>;

	const nameControl = 'name';
	const dateControl = 'date';
	const descriptionControl = 'description';
	const weekDayControl = 'weekDay';
	const routePlannerId = 'f9fdeba5-4111-4744-89f6-5c33da51b8bf';
	const dynamicRoutePlannerId = 'f9fdeba5-4111-4744-89f6-5c3a3dabdf8bf';
	let routeDutyId: string | null;

	const maskConfig: Partial<IConfig> = {
		validation: false,
	};

	beforeEach(waitForAsync(() => {
		textProcessingServiceSpy = jasmine.createSpyObj(
			'TextProcessingService',
			['extractFromHourFromControl', 'extractToHourFromControl'],
		);
		routerHelperServiceSpy = jasmine.createSpyObj('RouterHelperService', [
			'getParameterValue',
		]);
		snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', [
			'onShowSnackBarError',
		]);
		routeDutyId = null;
		routerHelperServiceSpy.getParameterValue.and.returnValue(routePlannerId);
		dutyHelperServiceSpy = jasmine.createSpyObj('DutyHelperService', [
			'crateArrayOfDutiesBasedOnWeekDays',
			'setAmountOfDuties',
			'createArrayOfDutiesBasedOnTimes',
		]);
		mockStore = jasmine.createSpyObj('Store', ['dispatch', 'selectSignal']);

		mockStore.selectSignal.and.returnValue(signal(MOCK_PLANNERS[2]));
		dutyHelperServiceSpy.crateArrayOfDutiesBasedOnWeekDays.and.returnValue(
			DUTY_MOCK,
		);

		TestBed.configureTestingModule({
			imports: [
				TaskBoardFormComponent,
				TranslateModule.forRoot(),
				NoopAnimationsModule,
				NgxMaskDirective,
				ReactiveFormsModule,
				MatInputModule,
				MatFormFieldModule,
			],
			providers: [
				{
					provide: TextProcessingService,
					useValue: textProcessingServiceSpy,
				},
				{ provide: Store, useValue: mockStore },
				{ provide: NGX_MASK_CONFIG, useValue: maskConfig },
				{
					provide: RouterHelperService,
					useValue: routerHelperServiceSpy,
				},
				{
					provide: SnackBarService,
					useValue: snackBarServiceSpy,
				},
				{
					provide: DutyHelperService,
					useValue: dutyHelperServiceSpy,
				},
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: {
							paramMap: {
								has(param: string): boolean {
									return param === 'dutyId' && !!routeDutyId;
								},
								get(param: string): string | null {
									return param === 'dutyId'
										? routeDutyId
										: routePlannerId;
								},
							},
						},
					},
				},
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(TaskBoardFormComponent);
				component = fixture.componentInstance;
				component.currentPlanner = signal(MOCK_PLANNERS[2]);
				component.isConstantPlanner.set(true);
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
			component.formModel()?.formGroup().get(descriptionControl),
		).toBeTruthy();
		expect(
			component.formModel()?.formGroup().get(dateControl),
		).toBeTruthy();
	});

	it('should create additional day control if user selected constant planner', () => {
		expect(
			component.formModel()?.formGroup().get(weekDayControl),
		).toBeTruthy();
	});

	it('should form has default values on form', () => {
		expect(component.formModel()?.formGroup().get(nameControl)?.value).toBe(
			'',
		);
		expect(
			component.formModel()?.formGroup().get(descriptionControl)?.value,
		).toBe('');
		expect(component.formModel()?.formGroup().get(dateControl)?.value).toBe(
			'',
		);
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

	it('should control date has error, if user provide invalid value', () => {
		const date = component.formModel()?.formGroup().get(dateControl);
		date?.setValue('null, 12:0 - 13:00');
		fixture.detectChanges();

		expect(date?.errors).toBeTruthy();
	});

	it('should control date has error, if user provide invalid times range', () => {
		const date = component.formModel()?.formGroup().get(dateControl);
		date?.setValue('null, 12:00 - 11:00');
		fixture.detectChanges();

		expect(date?.errors).toBeTruthy();
	});

	it('should control date has error, if user provide to small time difference', () => {
		const date = component.formModel()?.formGroup().get(dateControl);
		date?.setValue('null, 12:00 - 12:20');
		fixture.detectChanges();

		expect(date?.errors).toBeTruthy();
	});

	it('should control date has error, if user provide invalid time format', () => {
		const date = component.formModel()?.formGroup().get(dateControl);
		date?.setValue('null, 12:00 - 9:00');
		fixture.detectChanges();

		expect(date?.errors).toBeTruthy();
	});

	it('should does not have errors if user provide valid date time', () => {
		const date = component.formModel()?.formGroup().get(dateControl);
		date?.setValue('null, 12:00 - 13:00');
		fixture.detectChanges();

		expect(date?.errors).toBeNull();
	});

	it('should have error if user provide times out of range from configured planner', () => {
		const date = component.formModel()?.formGroup().get(dateControl);
		date?.setValue('null, 07:00 - 13:00');
		fixture.detectChanges();

		expect(date?.errors).not.toBeNull();
	});

	it('should dispatch constant planner duty payload using route planner id', () => {
		component.formModel()?.tileColor.set('#B39DDB');

		component
			.formModel()
			?.formGroup()
			.get(dateControl)
			?.setValue('null, 12:00 - 13:00');
		component
			.formModel()
			?.formGroup()
			.get(nameControl)
			?.setValue('Matematyka');
		component
			.formModel()
			?.formGroup()
			.get(descriptionControl)
			?.setValue('Opis testowy');
		component
			?.formModel()
			?.formGroup()
			.get(weekDayControl)
			?.setValue(['MONDAY']);

		textProcessingServiceSpy.extractFromHourFromControl.and.returnValue(
			'10:00',
		);
		textProcessingServiceSpy.extractToHourFromControl.and.returnValue(
			'13:00',
		);

		component.sendForm();
		fixture.detectChanges();

		expect(component.plannerId).toBe(routePlannerId);
		expect(mockStore.dispatch).toHaveBeenCalledWith(
			dutyActions.saveDuty({
				duties: DUTY_MOCK,
				plannerId: routePlannerId,
				redirectToBoard: true,
				plannerType: PlannerType.Constant,
			}),
		);
	});

	it('should save duty when user click add button and create new', () => {
		component.formModel()?.tileColor.set('#B39DDB');

		component
			.formModel()
			?.formGroup()
			.get(dateControl)
			?.setValue('null, 12:00 - 13:00');
		component
			.formModel()
			?.formGroup()
			.get(nameControl)
			?.setValue('Matematyka');
		component
			.formModel()
			?.formGroup()
			.get(descriptionControl)
			?.setValue('Opis testowy');
		component
			?.formModel()
			?.formGroup()
			.get(weekDayControl)
			?.setValue(['MONDAY']);

		textProcessingServiceSpy.extractFromHourFromControl.and.returnValue(
			'10:00',
		);
		textProcessingServiceSpy.extractToHourFromControl.and.returnValue(
			'13:00',
		);

		component.saveAndClearForm();
		fixture.detectChanges();

		expect(mockStore.dispatch).toHaveBeenCalled();
		expect(component.formModel()?.formGroup().get(nameControl)?.value).toBe(
			null,
		);
		expect(
			component.formModel()?.formGroup().get(descriptionControl)?.value,
		).toBe(null);
		expect(component.formModel()?.formGroup().get(dateControl)?.value).toBe(
			null,
		);
	});

	it('should call createArrayOfDutiesBasedOnTimes if user provided three different times for dynamic planner', () => {
		fixture.detectChanges();

		component.plannerId = 'f9fdeba5-4111-4744-89f6-5c3a3dabdf8bf';
		component.currentPlanner = signal(MOCK_PLANNERS[3]);
		component.isConstantPlanner.set(false);
		component.formModel()!.isConstantPlanner = false;
		component.formModel()?.tileColor.set('#B39DDB');

		fixture.detectChanges();

		component
			.formModel()
			?.formGroup()
			.get(nameControl)
			?.setValue('Matematyka');

		const addingDate1 = '12-12-2024, 12:00 - 13:00';
		const addingDate2 = '12-12-2024, 13:00 - 14:00';
		const addingDate3 = '12-12-2024, 15:00 - 16:00';

		component
			.formModel()
			?.addedChipTagsDates.set([addingDate1, addingDate2, addingDate3]);
		fixture.detectChanges();

		component.formModel()?.toModel();

		component.sendForm();

		fixture.detectChanges();

		expect(
			dutyHelperServiceSpy.createArrayOfDutiesBasedOnTimes,
		).toHaveBeenCalled();
	});

	it('should dispatch dynamic planner duty payload using dynamic planner type', () => {
		fixture.detectChanges();

		component.plannerId = dynamicRoutePlannerId;
		component.currentPlanner = signal(MOCK_PLANNERS[3]);
		component.isConstantPlanner.set(false);
		component.formModel.set(
			TestBed.runInInjectionContext(
				() => new TaskBoardFormModel(false, MOCK_PLANNERS[3]),
			),
		);
		component.formModel()?.tileColor.set('#B39DDB');

		fixture.detectChanges();
		mockStore.dispatch.calls.reset();

		component
			.formModel()
			?.formGroup()
			.get(nameControl)
			?.setValue('Matematyka');
		
		const dynamicDuties = [
			{
				name: 'Matematyka',
				effectiveDate: '12-12-2024',
				from: '12:00',
				to: '13:00',
			},
			{
				name: 'Matematyka',
				effectiveDate: '12-12-2024',
				from: '13:00',
				to: '14:00',
			},
			{
				name: 'Matematyka',
				effectiveDate: '12-12-2024',
				from: '15:00',
				to: '16:00',
			},
		];
		dutyHelperServiceSpy.createArrayOfDutiesBasedOnTimes.and.returnValue(
			dynamicDuties,
		);

		const addingDate1 = '12-12-2024, 12:00 - 13:00';
		const addingDate2 = '12-12-2024, 13:00 - 14:00';
		const addingDate3 = '12-12-2024, 15:00 - 16:00';

		component
			.formModel()
			?.formGroup()
			.get(dateControl)
			?.setValue(addingDate1);
		component
			.formModel()
			?.addedChipTagsDates.set([addingDate1, addingDate2, addingDate3]);

		component.sendForm();

		fixture.detectChanges();

		expect(mockStore.dispatch).toHaveBeenCalledWith(
			dutyActions.saveDuty({
				duties: dynamicDuties,
				plannerId: dynamicRoutePlannerId,
				redirectToBoard: true,
				plannerType: PlannerType.Dynamic,
			}),
		);
	});

	it('should dispatch single duty update in edit mode', () => {
		const editedDuty = {
			id: 'duty-a',
			plannerId: routePlannerId,
			name: 'Original duty',
			description: 'Original description',
			weekDay: 'MONDAY' as const,
			from: '08:00',
			to: '09:00',
			color: '#B39DDB',
		};
		routeDutyId = 'duty-a';

		let selectSignalCallIndex = 0;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		mockStore.selectSignal.and.callFake((): any => {
			selectSignalCallIndex++;

			if (selectSignalCallIndex === 1) {
				return signal(MOCK_PLANNERS[2]);
			}

			if (selectSignalCallIndex === 2) {
				return signal(editedDuty);
			}

			return signal([]);
		});
		mockStore.dispatch.calls.reset();

		fixture = TestBed.createComponent(TaskBoardFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		component.formModel()?.formGroup().patchValue({
			[nameControl]: 'Updated duty',
			[descriptionControl]: 'Updated description',
			[dateControl]: 'null, 10:00 - 11:00',
			[weekDayControl]: 'TUESDAY',
		});
		component.formModel()?.tileColor.set('#FFCC99');
		textProcessingServiceSpy.extractFromHourFromControl.and.returnValue(
			'10:00',
		);
		textProcessingServiceSpy.extractToHourFromControl.and.returnValue(
			'11:00',
		);
		dutyHelperServiceSpy.crateArrayOfDutiesBasedOnWeekDays.calls.reset();

		component.sendForm();

		expect(
			dutyHelperServiceSpy.crateArrayOfDutiesBasedOnWeekDays,
		).not.toHaveBeenCalled();

		expect(mockStore.dispatch).toHaveBeenCalledWith(
			dutyActions.updateDuty({
				duty: jasmine.objectContaining({
					id: 'duty-a',
					plannerId: routePlannerId,
					name: 'Updated duty',
					description: 'Updated description',
					from: '10:00',
					to: '11:00',
					weekDay: 'TUESDAY',
					color: '#FFCC99',
				}) as unknown as DutyDto,
				dutyId: 'duty-a',
				plannerId: routePlannerId,
				plannerType: PlannerType.Constant,
				redirectToBoard: true,
			}),
		);
	});

	it('should block dynamic planner save if date was typed but not added as a chip', () => {
		fixture.detectChanges();

		component.plannerId = dynamicRoutePlannerId;
		component.currentPlanner = signal(MOCK_PLANNERS[3]);
		component.isConstantPlanner.set(false);
		component.formModel.set(
			TestBed.runInInjectionContext(
				() => new TaskBoardFormModel(false, MOCK_PLANNERS[3]),
			),
		);

		fixture.detectChanges();
		mockStore.dispatch.calls.reset();

		component
			.formModel()
			?.formGroup()
			.get(nameControl)
			?.setValue('Matematyka');
		component
			.formModel()
			?.formGroup()
			.get(dateControl)
			?.setValue('12-12-2024, 12:00 - 13:00');

		component.sendForm();

		expect(mockStore.dispatch).not.toHaveBeenCalledWith(
			jasmine.objectContaining({
				type: '[duty] Save duty',
			}),
		);
		expect(snackBarServiceSpy.onShowSnackBarError).toHaveBeenCalled();
	});

	it('should not clear dynamic planner form when missing added date chips blocks save and create', () => {
		fixture.detectChanges();

		component.currentPlanner = signal(MOCK_PLANNERS[3]);
		component.isConstantPlanner.set(false);
		component.formModel.set(
			TestBed.runInInjectionContext(
				() => new TaskBoardFormModel(false, MOCK_PLANNERS[3]),
			),
		);

		fixture.detectChanges();
		mockStore.dispatch.calls.reset();

		component
			.formModel()
			?.formGroup()
			.get(nameControl)
			?.setValue('Matematyka');
		component
			.formModel()
			?.formGroup()
			.get(dateControl)
			?.setValue('12-12-2024, 12:00 - 13:00');

		component.saveAndClearForm();

		expect(mockStore.dispatch).not.toHaveBeenCalledWith(
			jasmine.objectContaining({
				type: '[duty] Save duty',
			}),
		);
		expect(component.formModel()?.formGroup().get(nameControl)?.value).toBe(
			'Matematyka',
		);
		expect(component.formModel()?.formGroup().get(dateControl)?.value).toBe(
			'12-12-2024, 12:00 - 13:00',
		);
	});
});
