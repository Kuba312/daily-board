package com.dailyboard.dailyboard.controller;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.dailyboard.dailyboard.mapper.DutyMapper;
import com.dailyboard.dailyboard.model.dto.DutyDto;
import com.dailyboard.dailyboard.service.DutyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/api/v1/duties", produces = MediaType.APPLICATION_JSON_VALUE)
public class DutyController {

    private final DutyMapper dutyMapper;
    private final DutyService dutyService;

    @PostMapping("/{plannerId}")
    @ResponseStatus(HttpStatus.CREATED)
    public List<DutyDto> saveDuty(@RequestBody List<@Valid DutyDto> dutiesDto, @PathVariable String plannerId) {
        return dutyMapper.toDtos(dutyService.save(dutyMapper.toDaos(dutiesDto), plannerId));
    }

    @PutMapping("/{plannerId}/{dutyId}")
    public DutyDto updateDuty(
            @PathVariable String plannerId,
            @PathVariable String dutyId,
            @RequestBody @Valid DutyDto dutyDto
    ) {
        return dutyMapper.toDto(dutyService.update(plannerId, dutyId, dutyMapper.toDao(dutyDto)));
    }

    @DeleteMapping("/{plannerId}/{dutyId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDuty(@PathVariable String plannerId, @PathVariable String dutyId) {
        dutyService.delete(plannerId, dutyId);
    }

    @GetMapping("/dynamic/{plannerId}")
    public List<DutyDto> getDutiesByPlannerIdAndRangeTime(
            @PathVariable String plannerId,
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {
        return dutyMapper.toDtos(dutyService.getDutiesByPlannerIdAndRangeTime(plannerId, from, to));
    }

    @GetMapping("/constant")
    public List<DutyDto> getDutiesWithoutDates() {
        return dutyMapper.toDtos(dutyService.getDutiesWithoutDates());
    }

    @GetMapping("/{plannerId}")
    public List<DutyDto> getDutiesByPlannerId(@PathVariable String plannerId) {
        return dutyMapper.toDtos(dutyService.getDutiesByPlannerId(plannerId));
    }
}
