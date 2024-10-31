package com.dailyboard.dailyboard.controller;

import com.dailyboard.dailyboard.mapper.DutyMapper;
import com.dailyboard.dailyboard.model.dto.DutyDto;
import com.dailyboard.dailyboard.service.DutyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/api/v1/duties", produces = MediaType.APPLICATION_JSON_VALUE)
public class DutyController {

    private final DutyMapper dutyMapper;
    private final DutyService dutyService;

    @PostMapping("/{plannerId}")
    @ResponseStatus(HttpStatus.CREATED)
    public DutyDto saveDuty(@RequestBody DutyDto dutyDto, @PathVariable UUID plannerId) {
        return dutyMapper.toDto(dutyService.save(dutyMapper.toDao(dutyDto), plannerId));
    }

    @GetMapping()
    public List<DutyDto> getDuties(@RequestParam LocalDate from, @RequestParam LocalDate to) {
        return  dutyMapper.toDtos(dutyService.getDuties(from, to));
    }

    @GetMapping("/constant")
    public List<DutyDto> getDutiesWithoutDates() {
        return  dutyMapper.toDtos(dutyService.getDutiesWithoutDates());
    }
}
