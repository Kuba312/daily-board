package com.dailyboard.dailyboard.config;

import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Configuration
public class OpenApiConfig {

    static {
        SpringDocUtils.getConfig().replaceWithClass(org.springframework.data.domain.Pageable.class,
                org.springdoc.core.converters.models.Pageable.class);
        SpringDocUtils.getConfig().replaceWithClass(LocalTime.class, String.class);
        SpringDocUtils.getConfig().replaceWithClass(LocalDateTime.class, String.class);
        SpringDocUtils.getConfig().replaceWithClass(LocalDate.class, String.class);
    }
}
