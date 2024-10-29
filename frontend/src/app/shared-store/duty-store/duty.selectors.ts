import { createFeatureSelector, createSelector } from "@ngrx/store";
import { DutyState } from "./duty.state";
import { selectAll } from "./duty.reducer";

export const selectDutiesState = createFeatureSelector<DutyState>("duty")

export const selectAllDuties = createSelector(
    selectDutiesState,
    selectAll,
);