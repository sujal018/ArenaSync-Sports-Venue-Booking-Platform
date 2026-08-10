package com.turfbooking.dto.pricing;


import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

import com.turfbooking.enums.PricingRuleType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PricingRuleRequestDto {

    @NotNull(message = "Rule type is required")
    private PricingRuleType ruleType;

    // WEEKEND
    private DayOfWeek dayOfWeek;

    // PEAK_HOUR
    private LocalTime startTime;

    private LocalTime endTime;

    // HOLIDAY / EVENT
    private LocalDate startDate;

    private LocalDate endDate;

    @DecimalMin(value = "1.0", message = "Multiplier must be at least 1.0")
    private Double multiplier = 1.0;

    private Double fixedPrice;

    private Boolean active = true;
}