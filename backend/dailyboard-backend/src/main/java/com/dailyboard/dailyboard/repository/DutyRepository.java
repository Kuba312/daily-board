package com.dailyboard.dailyboard.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.dailyboard.dailyboard.model.dao.Duty;

public interface DutyRepository extends JpaRepository<Duty, UUID>, JpaSpecificationExecutor<Duty> {

    List<Duty> findByEffectiveDateBetween(LocalDate from, LocalDate to);

    List<Duty> findByEffectiveDateIsNull();

    List<Duty> findByPlannerId(String id);

}
