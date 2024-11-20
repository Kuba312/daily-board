package com.dailyboard.dailyboard.exepctions;

import com.dailyboard.dailyboard.model.dto.ConflictingDutyDto;
import lombok.Getter;

import java.util.List;

@Getter
public class DutyConflictException extends RuntimeException {

    private final List<ConflictingDutyDto> conflictingDuties;

    public DutyConflictException(String message, List<ConflictingDutyDto> conflictingDuties) {
        super(message);
        this.conflictingDuties = conflictingDuties;
    }
}
