package com.dailyboard.dailyboard.validation.impl;

import com.dailyboard.dailyboard.model.dto.DutyDto;
import com.dailyboard.dailyboard.validation.StartEndDateValid;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StartEndDateValidImpl implements ConstraintValidator<StartEndDateValid, DutyDto> {

    @Override
    public boolean isValid(DutyDto dutyDto, ConstraintValidatorContext constraintValidatorContext) {
        return dutyDto.getTo() != null && dutyDto.getFrom() != null && dutyDto.getTo().isAfter(dutyDto.getFrom());
    }
}
