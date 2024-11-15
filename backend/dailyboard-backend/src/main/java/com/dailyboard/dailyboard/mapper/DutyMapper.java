package com.dailyboard.dailyboard.mapper;

import com.dailyboard.dailyboard.model.dao.Duty;
import com.dailyboard.dailyboard.model.dto.DutyDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DutyMapper {

    @Mapping(source = "startTime", target = "from")
    @Mapping(source = "endTime", target = "to")
    @Mapping(source = "planner.id", target = "plannerId")
    DutyDto toDto(Duty duty);

    @Mapping(source = "from", target = "startTime")
    @Mapping(source = "to", target = "endTime")
    @Mapping(source = "plannerId", target = "planner.id")
    Duty toDao(DutyDto duty);


    List<DutyDto> toDtos(List<Duty> duties);
    List<Duty> toDaos(List<DutyDto> duties);
}
