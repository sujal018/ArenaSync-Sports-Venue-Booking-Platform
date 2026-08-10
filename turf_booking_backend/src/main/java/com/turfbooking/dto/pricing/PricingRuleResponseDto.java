package com.turfbooking.dto.pricing;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.turfbooking.enums.PricingRuleType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PricingRuleResponseDto {

    private Long id;

    private PricingRuleType ruleType;

    private DayOfWeek dayOfWeek;

    private LocalTime startTime;

    private LocalTime endTime;

    private LocalDate startDate;

    private LocalDate endDate;

    private Double multiplier;

    private Double fixedPrice;

    private Boolean active;

    private Long turfId;

    private String turfName;

    private LocalDateTime createdOn;
}