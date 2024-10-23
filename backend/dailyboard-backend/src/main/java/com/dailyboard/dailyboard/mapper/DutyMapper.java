package com.dailyboard.dailyboard.mapper;

import com.dailyboard.dailyboard.model.dao.Duty;
import com.dailyboard.dailyboard.model.dto.DutyDto;

import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DutyMapper {

//    @Mapping(source = "startDate", target = "from")
    DutyDto toDto(Duty duty);
    List<DutyDto> toDtos(List<Duty> duties);


    Duty toDao(DutyDto duty);
    List<Duty> toDaos(List<DutyDto> duties);
}
