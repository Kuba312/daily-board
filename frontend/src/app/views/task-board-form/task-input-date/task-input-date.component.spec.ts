import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import TaskInputDateComponent from './task-input-date.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SnackBarService } from '@shared/services/snackbar-service/snack-bar.service';
import { TimeValidators } from '@shared/validators/time.validators';

describe('TaskInputDateComponent', () => {
	let component: TaskInputDateComponent;
	let fixture: ComponentFixture<TaskInputDateComponent>;
	let snackbarServiceSpy: jasmine.SpyObj<SnackBarService>;

	let formGroupMock: FormGroup;

	beforeEach(waitForAsync(() => {
		snackbarServiceSpy = jasmine.createSpyObj('SnackBarService', [
			'onShowSnackBarError',
		]);
		TestBed.configureTestingModule({
			imports: [
				TaskInputDateComponent,
				TranslateModule.forRoot(),
				ReactiveFormsModule,
				NoopAnimationsModule,
			],
			providers: [
				{
					provide: SnackBarService,
					useValue: snackbarServiceSpy,
				},
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(TaskInputDateComponent);
				component = fixture.componentInstance;

				fixture.componentRef.setInput('controlName', 'date');

				formGroupMock = new FormGroup({
					date: new FormControl('', [
						TimeValidators.validateDate(),
						TimeValidators.validateTime(),
						TimeValidators.validateMinimumTimeDifference(),
					]),
				});

				fixture.componentRef.setInput('formGroup', formGroupMock);
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should add duty time to chip tag array', () => {
		const addingDate = '12-12-2024, 12:00 - 13:00';

		component
			.formGroup()
			.get(component.controlName())
			?.setValue(addingDate);

		component.onAddChipTagDate();

		expect(component.addedChipTagsDates()?.length).toEqual(1);
	});

	it('should return an error if user tries to add overlapping chip tags', () => {
		const addingDate = '12-12-2024, 12:00 - 13:00';

		component.addedChipTagsDates.set([addingDate]);
		component
			.formGroup()
			.get(component.controlName())
			?.setValue(addingDate);

		component.onAddChipTagDate();

		expect(snackbarServiceSpy.onShowSnackBarError).toHaveBeenCalledTimes(1);

		fixture.detectChanges();
	});

	it('should allow add duty time if user provided invalid date', () => {
		const addingDate = '12-12-2024, 12:00 - 13:00';

		component
			.formGroup()
			.get(component.controlName())
			?.setValue(addingDate);

		fixture.detectChanges();

		expect(component.invalidDateControl).toBe(false);
	});

	it('should block add duty time if user provided invalid date', () => {
		const addingDate = '13-13-2024, 12:00 - 13:00';

		component
			.formGroup()
			.get(component.controlName())
			?.setValue(addingDate);

		fixture.detectChanges();

		expect(component.invalidDateControl).toBe(true);
	});

	it('should block add duty time if user provided invalid time', () => {
		const addingDate = '13-13-2024, 13:00 - 12:00';

		component
			.formGroup()
			.get(component.controlName())
			?.setValue(addingDate);

		fixture.detectChanges();

		expect(component.invalidDateControl).toBe(true);
	});

	it('should block add duty time if user provided too small time difference', () => {
		const addingDate = '13-13-2024, 13:00 - 13:20';

		component
			.formGroup()
			.get(component.controlName())
			?.setValue(addingDate);

		fixture.detectChanges();

		expect(component.invalidDateControl).toBe(true);
	});

	it('should remove duty time', () => {
		const addingDate1 = '12-12-2024, 12:00 - 13:00';
		const addingDate2 = '12-12-2024, 13:00 - 14:00';
		const addingDate3 = '12-12-2024, 15:00 - 16:00';

		component.addedChipTagsDates.set([
			addingDate1,
			addingDate2,
			addingDate3,
		]);

		component.onChipTagDateRemoved(1);

		fixture.detectChanges();

		expect(component.addedChipTagsDates()?.length).toBe(2);
	});
});
