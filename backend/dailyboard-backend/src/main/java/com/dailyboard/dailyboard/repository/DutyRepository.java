package com.dailyboard.dailyboard.repository;

import com.dailyboard.dailyboard.model.dao.Duty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DutyRepository extends JpaRepository<Duty, UUID> {

    List<Duty> findByEffectiveDateBetween(LocalDate from, LocalDate to);

    List<Duty> findByEffectiveDateIsNull();

    List<Duty> findByPlannerId(String id);

    @Query("SELECT d FROM Duty d WHERE d.planner.id = :plannerId AND " +
            "(d.effectiveDate IS NULL OR d.effectiveDate = :effectiveDate) AND " +
            "(d.weekDay = :weekDay) AND " +
            "(:newStartTime < d.endTime AND :newEndTime > d.startTime)")
    List<Duty> findConflictingDuties(@Param("plannerId") String plannerId,
                                     @Param("effectiveDate") LocalDate effectiveDate,
                                     @Param("weekDay") DayOfWeek weekDay,
                                     @Param("newStartTime") LocalTime newStartTime,
                                     @Param("newEndTime") LocalTime newEndTime);
}
