import { Option } from '@core/types/basics.types';
import { DutyDto } from 'src/api/models';
import { EntityState } from '@ngrx/entity';

export interface DutyState extends EntityState<DutyDto> {
	isLoading: boolean;
	error: Option<string>;
	allDutiesLoaded: boolean;
}
