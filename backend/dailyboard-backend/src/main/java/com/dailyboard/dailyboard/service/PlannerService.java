package com.dailyboard.dailyboard.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dailyboard.dailyboard.model.dao.Planner;
import com.dailyboard.dailyboard.repository.PlannerRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlannerService {

    private final PlannerRepository plannerRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public Planner savePlanner(Planner planner) {
        planner.setOwner(authenticatedUserService.getCurrentUser());

        return plannerRepository.save(planner);
    }

    public List<Planner> getPlanners() {
        return plannerRepository.findAllByOwnerId(authenticatedUserService.getCurrentUser().getId());
    }

    public Planner getPlanner(String id) {
        return plannerRepository
                .findByIdAndOwnerId(id, authenticatedUserService.getCurrentUser().getId())
                .orElseThrow(() -> new EntityNotFoundException("Planner with ID: " + id + " not found"));
    }

}
