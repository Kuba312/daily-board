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

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    @Schema(type = "string", example = "22:00")
    private LocalTime endTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    @Schema(type = "string", example = "07:00")
    private LocalTime startTime;

    private Boolean isConstant;
}
