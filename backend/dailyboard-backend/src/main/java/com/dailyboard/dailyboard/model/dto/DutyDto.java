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
    private String from;
    private String to;
    private LocalDate effectiveDate;
    private LocalTime effectiveTime;
}
