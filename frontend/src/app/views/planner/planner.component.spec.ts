import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import HeaderComponent from "@shared/components/header/header.component";
import { TranslateModule } from "@ngx-translate/core";
import { MockComponent } from "ng-mocks";
import { DUTIES_MOCK } from "src/mocks/mock-data";
import PlannerComponent from "./planner.component";
import { Store } from "@ngrx/store";
import { signal } from "@angular/core";

describe('PlannerComponent', () => {
	let component: PlannerComponent;
	let fixture: ComponentFixture<PlannerComponent>;
	let mockStore: jasmine.SpyObj<Store>;

	beforeEach(waitForAsync(() => {
		mockStore = jasmine.createSpyObj('Store', ['selectSignal']);
		mockStore.selectSignal.and.returnValue(signal(DUTIES_MOCK));

		TestBed.configureTestingModule({
			imports: [
				PlannerComponent,
				TranslateModule.forRoot(),
				MockComponent(HeaderComponent),
			],
			providers: [
				{ provide: Store, useValue: mockStore },
			],
		}).compileComponents()
		.then(() => {
			fixture = TestBed.createComponent(PlannerComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
		}) 
	}))

	it('should create', () => {
		expect(component).toBeTruthy();
	})

	it('should show planner board days headers properly', () => {
		const headerComponent = fixture.debugElement.query(
			By.directive(HeaderComponent),
		);

		expect(headerComponent).toBeTruthy();
	});
})
