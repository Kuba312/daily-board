package com.dailyboard.dailyboard.service;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dailyboard.dailyboard.exepctions.PlannerShapeChangeRequiresConfirmationException;
import com.dailyboard.dailyboard.model.dao.Planner;
import com.dailyboard.dailyboard.model.dto.PlannerUpdateDto;
import com.dailyboard.dailyboard.repository.DutyRepository;
import com.dailyboard.dailyboard.repository.PlannerRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlannerService {

    private final PlannerRepository plannerRepository;
    private final DutyRepository dutyRepository;
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

    @Transactional
    public Planner updatePlanner(String id, PlannerUpdateDto updateDto) {
        Planner planner = getPlanner(id);

        boolean shapeChanged = !Objects.equals(planner.getStartTime(), updateDto.getStartTime())
                || !Objects.equals(planner.getEndTime(), updateDto.getEndTime())
                || !Objects.equals(planner.getIsConstant(), updateDto.getIsConstant());
        boolean hasDuties = dutyRepository.existsByPlannerId(id);

        if (shapeChanged && hasDuties) {
            if (!Boolean.TRUE.equals(updateDto.getConfirmDutyDeletionOnShapeChange())) {
                throw new PlannerShapeChangeRequiresConfirmationException(
                        "Planner shape change requires confirmation because existing duties will be deleted"
                );
            }

            dutyRepository.deleteByPlannerId(id);
        }

        planner.setName(updateDto.getName());
        planner.setNote(updateDto.getNote());
        planner.setStartTime(updateDto.getStartTime());
        planner.setEndTime(updateDto.getEndTime());
        planner.setIsConstant(updateDto.getIsConstant());

        return plannerRepository.save(planner);
    }

    @Transactional
    public void deletePlanner(String id) {
        Planner planner = getPlanner(id);

        plannerRepository.delete(planner);
    }

}
