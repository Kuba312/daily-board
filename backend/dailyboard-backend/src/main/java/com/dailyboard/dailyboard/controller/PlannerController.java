package com.dailyboard.dailyboard.controller;

import com.dailyboard.dailyboard.mapper.PlannerMapper;
import com.dailyboard.dailyboard.model.dto.PlannerDto;
import com.dailyboard.dailyboard.service.PlannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/api/v1/planners", produces = MediaType.APPLICATION_JSON_VALUE)
public class PlannerController {

    private final PlannerMapper plannerMapper;
    private final PlannerService plannerService;

    @PostMapping()
    @ResponseStatus(HttpStatus.CREATED)
    public PlannerDto savePlanner(@RequestBody PlannerDto plannerDto) {
        return plannerMapper.toDto(plannerService.savePlanner(plannerMapper.toDao(plannerDto)));
    }

    @GetMapping("/all")
    public List<PlannerDto> getPlanners() {
        return plannerMapper.toDtos(plannerService.getPlanners());
    }

    @GetMapping("/{id}")
    public PlannerDto getPlannerById(@PathVariable UUID id) {
        return  plannerMapper.toDto(plannerService.getPlanner(id));
    }

}
