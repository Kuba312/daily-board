package com.dailyboard.dailyboard.model.dao;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Duty {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private DayOfWeek weekDay;

    private LocalDate effectiveDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String color;

    @ManyToOne
    @JoinColumn(name = "planner_id")
    private Planner planner;
}
