package com.dailyboard.dailyboard.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import com.dailyboard.dailyboard.controller.JpaUtils;
import com.dailyboard.dailyboard.exepctions.DutyConflictException;
import com.dailyboard.dailyboard.model.dto.ConflictingDutyDto;
import org.springframework.data.jpa.domain.Specification;
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

    public List<Duty> save(List<Duty> duties, String plannerId) {
        checkConflictedDuties(duties, plannerId);

        return saveDuties(duties, plannerId);
    }

    public List<Duty> getDuties(String plannerId, LocalDate from, LocalDate to) {
        return dutyRepository.findByPlannerIdAndEffectiveDateBetween(plannerId, from, to);
    }

    public List<Duty> getDutiesByPlannerId(String plannerId) {
        return dutyRepository.findByPlannerId(plannerId);
    }

    public List<Duty> getDutiesWithoutDates() {
        return dutyRepository.findByEffectiveDateIsNull();
    }


    private void checkConflictedDuties(List<Duty> duties, String plannerId) {
        List<Specification<Duty>> specifications = duties.stream()
                .map(duty -> Specification.where(
                        JpaUtils.isDateInRange(duty).and(
                                (root, query, criteriaBuilder) ->
                                        criteriaBuilder.equal(root.get("planner").get("id"), plannerId)
                        )
                ))
                .toList();

        Specification<Duty> combinedSpecification = specifications.stream()
                .reduce(Specification.where(null), Specification::or);

        List<Duty> conflictingDuties = dutyRepository.findAll(combinedSpecification);

        if (!conflictingDuties.isEmpty()) {
            List<ConflictingDutyDto> conflictingDutyDTOs = conflictingDuties.stream()
                    .map(conflictingDuty -> new ConflictingDutyDto(conflictingDuty.getId(), conflictingDuty.getName()))
                    .collect(Collectors.toList());

            throw new DutyConflictException("Conflict detected with the following duties: %s".formatted(conflictingDutyDTOs.stream()
                    .map(ConflictingDutyDto::getName)
                    .collect(Collectors.joining(", "))), conflictingDutyDTOs);
        }
    }


    private List<Duty> saveDuties(List<Duty> duties, String plannerId) {
        Planner planner = plannerRepository
                .findById(plannerId)
                .orElseThrow(() -> new EntityNotFoundException("Planner with ID: " + plannerId + " not found"));

        duties.forEach(duty -> duty.setPlanner(planner));

        return dutyRepository.saveAll(duties);
    }
}
