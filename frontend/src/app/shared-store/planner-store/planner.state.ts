import { Option } from "@core/types/basics.types";
import { EntityState } from "@ngrx/entity";
import { PlannerDto } from "src/api/models";

export interface PlannerState extends EntityState<PlannerDto> {
	isLoading: boolean;
	error: Option<string>;
	allPlannersLoaded: boolean;
}