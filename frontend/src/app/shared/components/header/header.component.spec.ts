import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import HeaderComponent from './header.component';
import { TranslateModule } from '@ngx-translate/core';
import { DateDisplayMode } from '@shared/enums/date-display-mode.enum';
import moment from 'moment';

describe('HeaderComponent', () => {
	let fixture: ComponentFixture<HeaderComponent>;
	let component: HeaderComponent;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [HeaderComponent, TranslateModule.forRoot()],
		})
			.compileComponents()
			.then(() => {
				TestBed.runInInjectionContext(() => {
					fixture = TestBed.createComponent(HeaderComponent);
					component = fixture.componentInstance;
				});
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should set week range if there is weekly strategy', () => {
		const startOfWeek = moment().startOf('week').toISOString();
		const endOfWeek = moment().endOf('week').toISOString();

		fixture.componentRef.setInput(
			'dateDisplayMode',
			DateDisplayMode.Weekly,
		);

		component.ngOnInit();

		expect(component.properDateDisplayMode()).toEqual(
			jasmine.objectContaining({
				startOfWeek,
				endOfWeek,
			}),
		);
	});

	it('should set day range if there is current day strategy', () => {
		fixture.componentRef.setInput('dateDisplayMode', DateDisplayMode.Daily);

		component.ngOnInit();

		expect(component.properDateDisplayMode()).not.toBe(null);
	});

	it('should set null if there is a none strategy set', () => {
		component.ngOnInit();

		expect(component.properDateDisplayMode()).toEqual(null);
	});
});
