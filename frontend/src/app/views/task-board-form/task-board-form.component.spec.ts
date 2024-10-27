import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { TextProcessingService } from '@shared/services/text-processing/text-processing.service';
import TaskBoardFormComponent from './task-board-form.component';
import { Store } from '@ngrx/store';

describe('TaskBoardFormComponent', () => {
	let fixture: ComponentFixture<TaskBoardFormComponent>;
	let component: TaskBoardFormComponent;
	let textProcessingServiceSpy: jasmine.SpyObj<TextProcessingService>;
	let mockStore: jasmine.SpyObj<Store>;

	const nameControl = 'name';
	const dateControl = 'date';
	const descriptionControl = 'description';
	const weekDayControl = 'weekDay';

	beforeEach(waitForAsync(() => {
		textProcessingServiceSpy = jasmine.createSpyObj(
			'TextProcessingService',
			['extractFromHourFromControl', 'extractToHourFromControl'],
		);
		mockStore = jasmine.createSpyObj('Store', ['dispatch']);

		TestBed.configureTestingModule({
			imports: [
				TaskBoardFormComponent,
				TranslateModule.forRoot(),
				NoopAnimationsModule,
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
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(TaskBoardFormComponent);
				component = fixture.componentInstance;
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should form has proper controls', () => {
		expect(component.formModel.formGroup().get(nameControl)).toBeTruthy();
		expect(
			component.formModel.formGroup().get(descriptionControl),
		).toBeTruthy();
		expect(component.formModel.formGroup().get(dateControl)).toBeTruthy();
	});

	it('should create additional day control if user selected constant planner', () => {
		expect(
			component.formModel.formGroup().get(weekDayControl),
		).toBeTruthy();
	});

	it('should form has default values on form', () => {
		expect(component.formModel?.formGroup().get(nameControl)?.value).toBe(
			'',
		);
		expect(
			component.formModel?.formGroup().get(descriptionControl)?.value,
		).toBe('');
		expect(component.formModel?.formGroup().get(dateControl)?.value).toBe(
			'',
		);
	});

	it('should call toModel method extractFromHourFromControl and extractToHourFromControl', () => {
		component.formModel.toModel();
		fixture.detectChanges();

		expect(
			textProcessingServiceSpy.extractFromHourFromControl,
		).toHaveBeenCalled();
		expect(
			textProcessingServiceSpy.extractToHourFromControl,
		).toHaveBeenCalled();
	});

	it('should control date has error, if user provide invalid value', () => {
		const date = component.formModel.formGroup().get(dateControl);
		date?.setValue('null, 12:0 - 13:00');
		fixture.detectChanges();

		expect(date?.errors).toBeTruthy();
	});

	it('should control date has error, if user provide invalid times range', () => {
		const date = component.formModel.formGroup().get(dateControl);
		date?.setValue('null, 12:00 - 11:00');
		fixture.detectChanges();

		expect(date?.errors).toBeTruthy();
	});

	it('should control date has error, if user provide invalid time format', () => {
		const date = component.formModel.formGroup().get(dateControl);
		date?.setValue('null, 12:00 - 9:00');
		fixture.detectChanges();

		expect(date?.errors).toBeTruthy();
	});

	it('should does not have errors if user provide valid date time', () => {
		const date = component.formModel.formGroup().get(dateControl);
		date?.setValue('null, 12:00 - 13:00');
		fixture.detectChanges();

		expect(date?.errors).toBeNull();
	});

	it('should save duty when user click add button', () => {
		component.formModel.tileColor.set('#B39DDB');

		component.formModel
			.formGroup()
			.get(dateControl)
			?.setValue('null, 12:00 - 13:00');
		component.formModel
			.formGroup()
			.get(nameControl)
			?.setValue('Matematyka');
		component.formModel
			.formGroup()
			.get(descriptionControl)
			?.setValue('Opis testowy');
		component.formModel.formGroup().get(weekDayControl)?.setValue('MONDAY');
		
		textProcessingServiceSpy.extractFromHourFromControl.and.returnValue('10:00');
		textProcessingServiceSpy.extractToHourFromControl.and.returnValue('13:00');

		const duty = component.formModel.toModel();

		component.sendForm();
		fixture.detectChanges();
		
		expect(mockStore.dispatch).toHaveBeenCalledWith(
			jasmine.objectContaining({
				type: '[duty] Save duty',
				duty: jasmine.objectContaining(duty),
			}),
		);
	});
});
