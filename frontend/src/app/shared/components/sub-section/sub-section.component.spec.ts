import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import SubSectionComponent from './sub-section.component';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('SubSectionComponent', () => {
	let fixture: ComponentFixture<SubSectionComponent>;
	let component: SubSectionComponent;
	let el: DebugElement;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [SubSectionComponent, MatIcon, TranslateModule.forRoot()],
		})
			.compileComponents()
			.then(() => {
				fixture = TestBed.createComponent(SubSectionComponent);
				component = fixture.componentInstance;
				el = fixture.debugElement;
				fixture.componentRef.setInput('subHeaderTitle', 'Title');
				fixture.detectChanges();
			});
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	})

	it('should toggle section if sub section is expandable', () => {
		fixture.componentRef.setInput('isExpandableSection', true);
		component.toggleSection();

		expect(component.isSectionHidden()).toBe(true);
	});

	it('should not toggle section if sub section is not expandable', () => {
		fixture.componentRef.setInput('isExpandableSection', false);
		component.toggleSection();

		expect(component.isSectionHidden()).toBe(false);
	});
	it('should rotate icon if section has been hidden', () => {
		fixture.componentRef.setInput('isExpandableSection', true);
		component.toggleSection();
		fixture.detectChanges();

		const arrow = el.query(By.css(".sub-section__title--arrow"));
		
		expect(arrow.nativeElement.classList).toContain('rotated-arrow')
	})

	it('should show section if icon arrow has been clicked two times', () => {
		fixture.componentRef.setInput('isExpandableSection', true);
		component.toggleSection();
		component.toggleSection();
		fixture.detectChanges();

		const arrow = el.query(By.css(".sub-section__content"));
		
		expect(arrow.nativeElement.classList).toContain('shown-content')
	})
});
