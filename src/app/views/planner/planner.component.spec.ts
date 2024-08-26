import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import HeaderComponent from "@shared/components/header/header.component";
import { TranslateModule } from "@ngx-translate/core";
import { MockComponent } from "ng-mocks";
import { DUTIES_MOCK } from "src/mocks/mock-data";
import PlannerComponent from "./planner.component";

describe('PlannerComponent', () => {
	let component: PlannerComponent;
	let fixture: ComponentFixture<PlannerComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				PlannerComponent,
				TranslateModule.forRoot(),
				MockComponent(HeaderComponent),
			],
		}).compileComponents()
		.then(() => {
			fixture = TestBed.createComponent(PlannerComponent);
			component = fixture.componentInstance;
			component.dailyBoardDuties.set(DUTIES_MOCK)
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
