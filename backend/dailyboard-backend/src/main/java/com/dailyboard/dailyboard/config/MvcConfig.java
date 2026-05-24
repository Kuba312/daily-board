package com.dailyboard.dailyboard.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    private final List<String> allowedOrigins;

    public MvcConfig(
            @Value("${APP_CORS_ALLOWED_ORIGINS:http://localhost:4200}") String allowedOriginsRaw
    ) {
        this.allowedOrigins = Arrays.stream(allowedOriginsRaw.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
       String[] origins = allowedOrigins.isEmpty()
               ? new String[] {"http://localhost:4200"}
               : allowedOrigins.toArray(String[]::new);

       registry.addMapping("/**")
               .allowedHeaders("*")
               .allowedOrigins(origins)
               .allowedMethods("*");
    }
}
