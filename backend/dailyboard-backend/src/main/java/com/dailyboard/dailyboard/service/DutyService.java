package com.dailyboard.dailyboard.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.dailyboard.dailyboard.model.dao.Duty;
import com.dailyboard.dailyboard.model.dao.Planner;
import com.dailyboard.dailyboard.repository.DutyRepository;
import com.dailyboard.dailyboard.repository.PlannerRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DutyService {

    private final DutyRepository dutyRepository;
    private final PlannerRepository plannerRepository;

    public Duty save(Duty duty, String plannerId) {
        Planner planner = plannerRepository
                .findById(plannerId)
                .orElseThrow(() -> new EntityNotFoundException("Planner with ID: " + plannerId + "not found"));

        duty.setPlanner(planner);

        return dutyRepository.save(duty);
    }

    public List<Duty> getDuties(LocalDate from, LocalDate to) {
        return dutyRepository.findByEffectiveDateBetween(from, to);
    }

    public List<Duty> getDutiesByPlannerId(String plannerId) {
        return dutyRepository.findByPlannerId(plannerId);
    }

    public List<Duty> getDutiesWithoutDates() {
        return dutyRepository.findByEffectiveDateIsNull();
    }
}
