package com.dailyboard.dailyboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dailyboard.dailyboard.model.dao.Planner;

public interface PlannerRepository extends JpaRepository<Planner, String> {
}
