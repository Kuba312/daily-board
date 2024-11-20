package com.dailyboard.dailyboard.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import com.dailyboard.dailyboard.exepctions.DutyConflictException;
import com.dailyboard.dailyboard.exepctions.InvalidDutyTimeException;
import com.dailyboard.dailyboard.model.dto.ConflictingDutyDto;
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
        checkTimeValidation(duty);

        checkConflictedDuties(duty, plannerId);

        return saveDuty(duty, plannerId);
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

    private static void checkTimeValidation(Duty duty) {
        if (duty.getStartTime() == null || duty.getEndTime() == null) {
            throw new InvalidDutyTimeException("StartTime and EndTime must not be null");
        }

        if (duty.getEndTime().isBefore(duty.getStartTime())) {
            throw new InvalidDutyTimeException("EndTime must be after StartTime");
        }
    }

    private void checkConflictedDuties(Duty duty, String plannerId) {
        List<Duty> conflictingDuties = dutyRepository.findConflictingDuties(
                plannerId,
                duty.getEffectiveDate(),
                duty.getWeekDay(),
                duty.getStartTime(),
                duty.getEndTime()
        );

        if (!conflictingDuties.isEmpty()) {
            List<ConflictingDutyDto> conflictingDutyDTOs = conflictingDuties.stream()
                    .map(conflictingDuty -> new ConflictingDutyDto(conflictingDuty.getId(), conflictingDuty.getName()))
                    .collect(Collectors.toList());

            throw new DutyConflictException("Conflict detected with duties: " + conflictingDutyDTOs, conflictingDutyDTOs);
        }
    }

    private Duty saveDuty(Duty duty, String plannerId) {
        Planner planner = plannerRepository
                .findById(plannerId)
                .orElseThrow(() -> new EntityNotFoundException("Planner with ID: " + plannerId + " not found"));

        duty.setPlanner(planner);
        return dutyRepository.save(duty);
    }
}
