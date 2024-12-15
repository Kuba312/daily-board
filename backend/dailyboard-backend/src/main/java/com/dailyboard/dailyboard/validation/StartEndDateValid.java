package com.dailyboard.dailyboard.validation;

import com.dailyboard.dailyboard.validation.impl.StartEndDateValidImpl;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = StartEndDateValidImpl.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface StartEndDateValid {
    String message() default "Start date cannot be after end date";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
