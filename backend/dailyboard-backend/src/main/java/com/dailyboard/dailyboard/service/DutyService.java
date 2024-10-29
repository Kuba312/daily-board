package com.dailyboard.dailyboard.service;

import com.dailyboard.dailyboard.model.dao.Duty;
import com.dailyboard.dailyboard.repository.DutyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DutyService {

    private final DutyRepository dutyRepository;

    public Duty save(Duty duty) {

        return dutyRepository.save(duty);
    }

    public List<Duty> getDuties(LocalDate from, LocalDate to) {
        return dutyRepository.findByEffectiveDateBetween(from, to);
    }

    public List<Duty> getDutiesWithoutDates() {
        return dutyRepository.findByEffectiveDateIsNull();
    }
}
