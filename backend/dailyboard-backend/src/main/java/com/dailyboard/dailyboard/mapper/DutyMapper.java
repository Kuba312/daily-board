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
    DutyDto toDto(Duty duty);

    @Mapping(source = "from", target = "startTime")
    @Mapping(source = "to", target = "endTime")
    Duty toDao(DutyDto duty);


    List<DutyDto> toDtos(List<Duty> duties);
    List<Duty> toDaos(List<DutyDto> duties);
}
