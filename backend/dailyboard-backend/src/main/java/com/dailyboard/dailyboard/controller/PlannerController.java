package com.dailyboard.dailyboard.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.dailyboard.dailyboard.mapper.PlannerMapper;
import com.dailyboard.dailyboard.model.dto.PlannerDto;
import com.dailyboard.dailyboard.model.dto.PlannerUpdateDto;
import com.dailyboard.dailyboard.service.PlannerService;

import lombok.RequiredArgsConstructor;

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
    public PlannerDto getPlannerById(@PathVariable String id) {
        return  plannerMapper.toDto(plannerService.getPlanner(id));
    }

    @PutMapping("/{id}")
    public PlannerDto updatePlanner(@PathVariable String id, @RequestBody PlannerUpdateDto plannerUpdateDto) {
        return plannerMapper.toDto(plannerService.updatePlanner(id, plannerUpdateDto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePlanner(@PathVariable String id) {
        plannerService.deletePlanner(id);
    }

}
