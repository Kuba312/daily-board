package com.dailyboard.dailyboard.repository;

import com.dailyboard.dailyboard.model.dao.Duty;
import com.dailyboard.dailyboard.model.dao.Planner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PlannerRepository extends JpaRepository<Planner, UUID> {
}
