package com.dailyboard.dailyboard.model.dto;


import com.dailyboard.dailyboard.model.enums.WeekDay;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DutyDto {

    private UUID id;
    private String name;
    private String description;
    private WeekDay weekDay;
    private LocalDate effectiveDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    @Schema(type = "string", example = "12:00")
    private LocalTime from;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    @Schema(type = "string", example = "12:00")
    private LocalTime to;

    private String color;
}
