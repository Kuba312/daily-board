package com.dailyboard.dailyboard.service;

import com.dailyboard.dailyboard.model.dao.Duty;
import com.dailyboard.dailyboard.model.dao.Planner;
import com.dailyboard.dailyboard.repository.DutyRepository;
import com.dailyboard.dailyboard.repository.PlannerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DutyService {

    private final DutyRepository dutyRepository;
    private final PlannerRepository plannerRepository;

    public Duty save(Duty duty, UUID plannerId) {
        Planner planner = plannerRepository
                .findById(plannerId)
                .orElseThrow(() -> new EntityNotFoundException("Planner with ID: " + plannerId + "not found"));

        duty.setPlanner(planner);

        return dutyRepository.save(duty);
    }

    public List<Duty> getDuties(LocalDate from, LocalDate to) {
        return dutyRepository.findByEffectiveDateBetween(from, to);
    }

    public List<Duty> getDutiesWithoutDates() {
        return dutyRepository.findByEffectiveDateIsNull();
    }
}
