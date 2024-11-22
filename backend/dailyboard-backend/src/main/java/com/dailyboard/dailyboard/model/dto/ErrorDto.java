package com.dailyboard.dailyboard.model.dto;


import java.util.List;

public record ErrorDto (String message, List<?> information){ }
