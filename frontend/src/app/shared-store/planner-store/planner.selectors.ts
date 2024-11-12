import { createFeatureSelector, createSelector } from "@ngrx/store";
import { PlannerState } from "./planner.state";
import { selectAll } from "./planner.reducer";

export const selectPlannersState = createFeatureSelector<PlannerState>("planner")

export const selectAllPlanners = createSelector(
    selectPlannersState,
    selectAll,
);