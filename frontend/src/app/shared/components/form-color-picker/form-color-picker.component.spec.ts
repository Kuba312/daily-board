import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import FormColorPickerComponent from './form-color-picker.component';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import TileColorComponent from './tile-color/tile-color.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('FormColorPickerComponent', () => {
	let fixture: ComponentFixture<FormColorPickerComponent>;
	let component: FormColorPickerComponent;
	let el: DebugElement;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				FormColorPickerComponent,
				TranslateModule.forRoot(),
				MockComponent(TileColorComponent),
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
	})

	it('should render tile color', () => {
		const tileColorComponent = el.query(
			By.directive(TileColorComponent),
		);

		expect(tileColorComponent).toBeTruthy();
	})

	it('should select color', () => {
		component.selectColor(1);

		expect(component.selectedIndexColor()).toEqual(1);
	})
});
