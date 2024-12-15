package com.dailyboard.dailyboard.exepctions;

import com.dailyboard.dailyboard.model.dto.ErrorDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DutyConflictException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorDto handleDutyConflictException(DutyConflictException ex) {
        return new ErrorDto(ex.getMessage(), ex.getConflictingDuties());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public void handleDutyDatesConflict(MethodArgumentNotValidException ex) {
        System.out.println(ex);
    }
}
