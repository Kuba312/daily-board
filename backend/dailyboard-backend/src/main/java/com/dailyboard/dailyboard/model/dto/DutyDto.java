package com.dailyboard.dailyboard.model.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DutyDto {

    private String id;
    private String name;
    private String description;
    private DayOfWeek weekDay;
    private LocalDate effectiveDate;
    private LocalTime from;
    private LocalTime to;

    private String color;
}
