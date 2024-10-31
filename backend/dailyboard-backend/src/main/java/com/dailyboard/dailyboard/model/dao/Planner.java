package com.dailyboard.dailyboard.model.dao;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Planner {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String title;
    private LocalTime untilTime;
    private Boolean isConstant;

    @OneToMany(mappedBy = "planner", orphanRemoval = true)
    private List<Duty> duties;
}
