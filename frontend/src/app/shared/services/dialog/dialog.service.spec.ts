import { TestBed, waitForAsync } from '@angular/core/testing';
import { DialogService } from './dialog.service';
import { PersistenceService } from '@core/services/persistance/persistance.service';
import { NgDialogAnimationService } from 'ng-dialog-animation';
import { DestroyRef, TemplateRef } from '@angular/core';
import { of, Subject } from 'rxjs';
import { DIALOGS_TO_NOT_SHOW } from '@core/app.consts';

class MockDestroyRef implements DestroyRef {
	readonly destroyed: boolean = false;
	private destroy$: Subject<void> = new Subject<void>();
	onDestroy(callback: () => void): () => void {
	  const subscription = this.destroy$.subscribe({ complete: callback });
	  return () => subscription.unsubscribe();
	}
	destroy(): void {
	  this.destroy$.next();
	  this.destroy$.complete();
	}
  }

describe('DialogService', () => {
  let service: DialogService;
  let persistenceServiceSpy: jasmine.SpyObj<PersistenceService>;
  let dialogAnimationServiceSpy: jasmine.SpyObj<NgDialogAnimationService>;

  beforeEach(
    waitForAsync(() => {
      const persistenceServiceMock = jasmine.createSpyObj('PersistenceService', [
        'get',
        'addToStructure',
      ]);
      const dialogAnimationServiceMock = jasmine.createSpyObj('NgDialogAnimationService', [
        'open',
      ]);

      TestBed.configureTestingModule({
        providers: [
          DialogService,
          { provide: PersistenceService, useValue: persistenceServiceMock },
          { provide: NgDialogAnimationService, useValue: dialogAnimationServiceMock },
        ],
      }).compileComponents();

      service = TestBed.inject(DialogService);
      persistenceServiceSpy = TestBed.inject(
        PersistenceService,
      ) as jasmine.SpyObj<PersistenceService>;
      dialogAnimationServiceSpy = TestBed.inject(
        NgDialogAnimationService,
      ) as jasmine.SpyObj<NgDialogAnimationService>;
    }),
  );

  describe('openSimpleDialog', () => {
    let destroyRef: DestroyRef;
    let component: TemplateRef<unknown>;

    beforeEach(() => {
      destroyRef = new MockDestroyRef();
      component = {} as TemplateRef<unknown>;
    });

    it('should not open the dialog if it is marked as not to show again', () => {
      persistenceServiceSpy.get.and.returnValue(['testComponentId']);

      service.openSimpleDialog(destroyRef, component, 'testComponentId');

      expect(dialogAnimationServiceSpy.open).not.toHaveBeenCalled();
    });

    it('should open the dialog if it is not marked as not to show again', () => {
      persistenceServiceSpy.get.and.returnValue([]);
      dialogAnimationServiceSpy.open.and.returnValue({
        afterClosed: () => of('resultString'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      service.openSimpleDialog(destroyRef, component, 'testComponentId');

      expect(dialogAnimationServiceSpy.open).toHaveBeenCalledWith(component, {
        data: {
          message: 'information-dialog.no-planner-to-chose',
          componentId: 'testComponentId',
        },
        disableClose: true,
        animation: {
          to: 'bottom',
        },
        width: '50rem',
        height: '20rem',
        position: { top: '10rem' },
      });
    });

    it('should call addToStructure when the dialog is closed with a string result', () => {
      persistenceServiceSpy.get.and.returnValue([]);
      dialogAnimationServiceSpy.open.and.returnValue({
        afterClosed: () => of('resultString'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      service.openSimpleDialog(destroyRef, component, 'testComponentId');

      expect(persistenceServiceSpy.addToStructure).toHaveBeenCalledWith(
        DIALOGS_TO_NOT_SHOW,
        ['resultString'],
      );
    });

    it('should not call addToStructure when the dialog is closed with a non-string result', () => {
      persistenceServiceSpy.get.and.returnValue([]);
      dialogAnimationServiceSpy.open.and.returnValue({
        afterClosed: () => of(123),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      service.openSimpleDialog(destroyRef, component, 'testComponentId');

      expect(persistenceServiceSpy.addToStructure).not.toHaveBeenCalled();
    });
  });
});
