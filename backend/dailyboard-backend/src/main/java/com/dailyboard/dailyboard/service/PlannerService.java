package com.dailyboard.dailyboard.service;

import com.dailyboard.dailyboard.model.dao.Planner;
import com.dailyboard.dailyboard.repository.PlannerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlannerService {

    private final PlannerRepository plannerRepository;

    public Planner savePlanner(Planner planner) {
        return plannerRepository.save(planner);
    }

    public List<Planner> getPlanners() {
        return plannerRepository.findAll();
    }

    public Planner getPlanner(UUID id) {
        return plannerRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Planner with ID: " + id + "not found"));
    }

}
