package com.dailyboard.dailyboard.model.dto;

import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlannerUpdateDto {

    private String name;
    private String note;
    private LocalTime endTime;
    private LocalTime startTime;
    private Boolean isConstant;
    private Boolean confirmDutyDeletionOnShapeChange;
}
