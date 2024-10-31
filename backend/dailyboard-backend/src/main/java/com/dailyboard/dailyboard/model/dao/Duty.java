package com.dailyboard.dailyboard.model.dao;

import com.dailyboard.dailyboard.model.enums.WeekDay;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

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
    private WeekDay weekDay;

    private LocalDate effectiveDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String color;

    @ManyToOne
    @JoinColumn(name = "planner_id")
    private Planner planner;
}
