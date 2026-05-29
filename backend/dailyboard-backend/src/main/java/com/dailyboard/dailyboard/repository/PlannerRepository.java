package com.dailyboard.dailyboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dailyboard.dailyboard.model.dao.Planner;

import java.util.List;
import java.util.Optional;

public interface PlannerRepository extends JpaRepository<Planner, String> {

    List<Planner> findAllByOwnerId(String ownerId);

    Optional<Planner> findByIdAndOwnerId(String id, String ownerId);
}
