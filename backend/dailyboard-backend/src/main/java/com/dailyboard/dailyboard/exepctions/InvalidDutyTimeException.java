package com.dailyboard.dailyboard.exepctions;

public class InvalidDutyTimeException extends RuntimeException {
    public InvalidDutyTimeException(String message) {
        super(message);
    }
}