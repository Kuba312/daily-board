package com.dailyboard.dailyboard.mapper;

import com.dailyboard.dailyboard.model.dao.Duty;
import com.dailyboard.dailyboard.model.dao.Planner;
import com.dailyboard.dailyboard.model.dto.DutyDto;
import com.dailyboard.dailyboard.model.dto.PlannerDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlannerMapper {

    PlannerDto toDto(Planner planner);
    Planner toDao(PlannerDto planner);


    List<PlannerDto> toDtos(List<Planner> planners);
    List<Planner> toDaos(List<PlannerDto> planners);
}
