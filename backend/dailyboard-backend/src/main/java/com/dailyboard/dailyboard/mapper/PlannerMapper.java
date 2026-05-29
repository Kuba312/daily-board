package com.dailyboard.dailyboard.mapper;

import com.dailyboard.dailyboard.model.dao.Planner;
import com.dailyboard.dailyboard.model.dto.PlannerDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PlannerMapper {

    PlannerDto toDto(Planner planner);
    @Mapping(target = "duties", ignore = true)
    @Mapping(target = "owner", ignore = true)
    Planner toDao(PlannerDto planner);


    List<PlannerDto> toDtos(List<Planner> planners);
    List<Planner> toDaos(List<PlannerDto> planners);
}
