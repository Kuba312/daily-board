package com.dailyboard.dailyboard.exepctions;

import com.dailyboard.dailyboard.model.dto.ErrorDto;
import jakarta.persistence.EntityNotFoundException;
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

    @ExceptionHandler(DuplicateEmailException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorDto handleDuplicateEmailException(DuplicateEmailException ex) {
        return new ErrorDto(ex.getMessage(), null);
    }

    @ExceptionHandler(PlannerShapeChangeRequiresConfirmationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorDto handlePlannerShapeChangeRequiresConfirmationException(
            PlannerShapeChangeRequiresConfirmationException ex
    ) {
        return new ErrorDto(ex.getMessage(), null);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorDto handleInvalidCredentialsException(InvalidCredentialsException ex) {
        return new ErrorDto(ex.getMessage(), null);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorDto handleEntityNotFoundException(EntityNotFoundException ex) {
        return new ErrorDto(ex.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorDto handleDutyDatesConflict(MethodArgumentNotValidException ex) {
        return new ErrorDto("Invalid request", null);
    }
}
