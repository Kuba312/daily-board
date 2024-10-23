package com.dailyboard.dailyboard.repository;

import com.dailyboard.dailyboard.model.dao.Duty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DutyRepository extends JpaRepository<Duty, UUID> {

    List<Duty> findByEffectiveDateBetween(LocalDate from, LocalDate to);
}
