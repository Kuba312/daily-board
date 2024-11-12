package com.dailyboard.dailyboard.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlannerDto {

    private String id;
    private String name;
    private String note;
    private LocalTime endTime;
    private LocalTime startTime;
    private Boolean isConstant;
}
