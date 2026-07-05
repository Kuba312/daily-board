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
    private final AuthenticatedUserService authenticatedUserService;

    public List<Duty> save(List<Duty> duties, String plannerId) {
        Planner planner = getCurrentUserPlanner(plannerId);

        checkConflictedDuties(duties, plannerId, null);

        return saveDuties(duties, planner);
    }

    public List<Duty> getDutiesByPlannerIdAndRangeTime(String plannerId, LocalDate from, LocalDate to) {
        getCurrentUserPlanner(plannerId);

        return dutyRepository.findByPlannerIdAndEffectiveDateBetween(plannerId, from, to);
    }

    public List<Duty> getDutiesByPlannerId(String plannerId) {
        getCurrentUserPlanner(plannerId);

        return dutyRepository.findByPlannerId(plannerId);
    }

    public List<Duty> getDutiesWithoutDates() {
        return dutyRepository.findByEffectiveDateIsNullAndPlannerOwnerId(
                authenticatedUserService.getCurrentUser().getId()
        );
    }

    public Duty update(String plannerId, String dutyId, Duty duty) {
        Planner planner = getCurrentUserPlanner(plannerId);
        Duty existingDuty = getPlannerDuty(plannerId, dutyId);

        duty.setId(dutyId);
        duty.setPlanner(planner);
        checkConflictedDuties(List.of(duty), plannerId, dutyId);

        existingDuty.setName(duty.getName());
        existingDuty.setDescription(duty.getDescription());
        existingDuty.setWeekDay(duty.getWeekDay());
        existingDuty.setEffectiveDate(duty.getEffectiveDate());
        existingDuty.setStartTime(duty.getStartTime());
        existingDuty.setEndTime(duty.getEndTime());
        existingDuty.setColor(duty.getColor());
        existingDuty.setPlanner(planner);

        return dutyRepository.save(existingDuty);
    }

    public void delete(String plannerId, String dutyId) {
        getCurrentUserPlanner(plannerId);
        Duty duty = getPlannerDuty(plannerId, dutyId);

        dutyRepository.delete(duty);
    }

    private void checkConflictedDuties(List<Duty> duties, String plannerId, String excludedDutyId) {
        if (duties.isEmpty()) {
            return;
        }

        List<Specification<Duty>> overlapSpecifications = duties.stream()
                .map(duty -> Specification.where(JpaUtils.isDateInRange(duty)))
                .toList();

        Specification<Duty> plannerSpecification = (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("planner").get("id"), plannerId);
        Specification<Duty> excludedDutySpecification = excludedDutyId == null
                ? Specification.where(null)
                : (root, query, criteriaBuilder) -> criteriaBuilder.notEqual(root.get("id"), excludedDutyId);
        Specification<Duty> overlapSpecification = overlapSpecifications.stream()
                .reduce(Specification.where(null), Specification::or);

        List<Duty> conflictingDuties = dutyRepository.findAll(
                Specification.where(plannerSpecification).and(excludedDutySpecification).and(overlapSpecification)
        );

        if (!conflictingDuties.isEmpty()) {
            List<ConflictingDutyDto> conflictingDutyDTOs = conflictingDuties.stream()
                    .map(conflictingDuty -> new ConflictingDutyDto(conflictingDuty.getId(), conflictingDuty.getName()))
                    .collect(Collectors.toList());

            throw new DutyConflictException("Conflict detected with the following duties: %s".formatted(conflictingDutyDTOs.stream()
                    .map(ConflictingDutyDto::getName)
                    .collect(Collectors.joining(", "))), conflictingDutyDTOs);
        }
    }


    private List<Duty> saveDuties(List<Duty> duties, Planner planner) {
        duties.forEach(duty -> duty.setPlanner(planner));

        return dutyRepository.saveAll(duties);
    }

    private Planner getCurrentUserPlanner(String plannerId) {
        return plannerRepository
                .findByIdAndOwnerId(
                        plannerId,
                        authenticatedUserService.getCurrentUser().getId()
                )
                .orElseThrow(() -> new EntityNotFoundException("Planner with ID: " + plannerId + " not found"));
    }

    private Duty getPlannerDuty(String plannerId, String dutyId) {
        return dutyRepository
                .findByIdAndPlannerId(dutyId, plannerId)
                .orElseThrow(() -> new EntityNotFoundException("Duty with ID: " + dutyId + " not found"));
    }
}
