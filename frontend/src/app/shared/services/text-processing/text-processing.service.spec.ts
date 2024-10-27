import { TestBed } from '@angular/core/testing';
import { TextProcessingService } from './text-processing.service';

describe('TextProcessingService', () => {
	let service: TextProcessingService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(TextProcessingService);
	});

	it('should convert time to LocalTime object for the first time part in convertFormHourToLocaleTime', () => {
		const result = service.extractFromHourFromControl('12:00-15:30');
		expect(result).toEqual('12:00');
	});

	it('should convert "12:00-15:30" to LocalTime object for the second time part in convertToHourToLocaleTime', () => {
		const result = service.extractToHourFromControl('12:00-15:30');
		expect(result).toEqual('15:30');
	});
});
