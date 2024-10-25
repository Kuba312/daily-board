package com.dailyboard.dailyboard.model.dto;


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
    private LocalDate effectiveDate;
    private LocalTime from;
    private LocalTime to;
}
