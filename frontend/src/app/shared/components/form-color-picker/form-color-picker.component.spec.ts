import { DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DutyHelperService } from '@shared/services/duty-helper/duty-helper.service';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import FormColorPickerComponent from './form-color-picker.component';
import TileColorComponent from './tile-color/tile-color.component';
import { dutyActions } from '@shared-store/duty-store/duty.actions';

describe('FormColorPickerComponent', () => {
	let fixture: ComponentFixture<FormColorPickerComponent>;
	let component: FormColorPickerComponent;
	let el: DebugElement;
	let mockStore: jasmine.SpyObj<Store>;
	let dutyHelperServiceSpy: jasmine.SpyObj<DutyHelperService>;

	beforeEach(waitForAsync(() => {
		dutyHelperServiceSpy = jasmine.createSpyObj('DutyHelperService', [
			'crateArrayOfDutiesBasedOnWeekDays',
			'setAmountOfDuties',
			'groupDutiesNamesByColors',
			'amountOfDuties',
		]);
		mockStore = jasmine.createSpyObj('Store', ['dispatch', 'selectSignal']);

		TestBed.configureTestingModule({
			imports: [
				FormColorPickerComponent,
				TranslateModule.forRoot(),
				MockComponent(TileColorComponent),
			],
			providers: [
				{ provide: Store, useValue: mockStore },
				{
					provide: DutyHelperService,
					useValue: dutyHelperServiceSpy,
				},
			],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(FormColorPickerComponent);
				component = fixture.componentInstance;
				el = fixture.debugElement;
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should render tile color', () => {
		const tileColorComponent = el.query(By.directive(TileColorComponent));

		expect(tileColorComponent).toBeTruthy();
	});

	it('should select color', () => {
		component.selectColor(1);

		expect(component.selectedIndexColor()).toEqual(1);
	});

	it('should dispatch getDutiesByPlannerId if duties are not loaded', () => {
		const plannerId = 'test-planner-id';
		spyOn(component, 'plannerId').and.returnValue(plannerId);
		spyOn(component, 'areDutiesLoaded').and.returnValue(false);
		mockStore.dispatch.calls.reset();
	
		component['duties'] = signal([]);
		component['_loadDuties']();
	
		expect(mockStore.dispatch).toHaveBeenCalledWith(
			dutyActions.getDutiesByPlannerId({ plannerId }),
		);
	});

	it('should not dispatch getDutiesByPlannerId if duties are loaded', () => {
		const plannerId = 'test-planner-id';
		spyOn(component, 'plannerId').and.returnValue(plannerId);
		spyOn(component, 'areDutiesLoaded').and.returnValue(true);
		mockStore.dispatch.calls.reset();
	
		component['_loadDuties']();
	
		expect(mockStore.dispatch).not.toHaveBeenCalled();
	});

	it('should not identify duties as loaded when list is empty', () => {
		spyOn(component, 'duties').and.returnValue([]);

		dutyHelperServiceSpy.amountOfDuties.and.returnValue(2);
	
		expect(component.areDutiesLoaded()).toBeFalse();
	});
	
	it('should handle empty dutiesGroupedColors signal correctly', () => {
		spyOn(component, 'duties').and.returnValue([]);
	
		const groupedColors = component.dutiesGroupedColors();
	
		expect(groupedColors.size).toBe(0);
	});
	
	it('should handle undefined plannerId correctly in _loadDuties', () => {
		spyOn(component, 'plannerId').and.returnValue(null);
		mockStore.dispatch.calls.reset();
	
		component['_loadDuties']();
	
		expect(mockStore.dispatch).not.toHaveBeenCalled();
	});

});
