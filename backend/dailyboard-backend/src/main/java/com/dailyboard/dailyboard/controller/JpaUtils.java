package com.dailyboard.dailyboard.controller;

import com.dailyboard.dailyboard.model.dao.Duty;
import org.springframework.data.jpa.domain.Specification;

public class JpaUtils {
    public static Specification<Duty> isDateInRange(Duty duty) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.and(
                criteriaBuilder.equal(root.get("weekDay"), duty.getWeekDay()),
                criteriaBuilder.or(
                        criteriaBuilder.isNull(root.get("effectiveDate")),
                        criteriaBuilder.equal(root.get("effectiveDate"), duty.getEffectiveDate())
                ),
                criteriaBuilder.lessThan(root.get("startTime"), duty.getEndTime()),
                criteriaBuilder.greaterThan(root.get("endTime"), duty.getStartTime())
        );
    }
}
