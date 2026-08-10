package com.turfbooking.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.turfbooking.dto.pricing.PricingRuleRequestDto;
import com.turfbooking.dto.pricing.PricingRuleResponseDto;

public interface PricingRuleService {

    // Add new pricing rule
    PricingRuleResponseDto addPricingRule(Long turfId,
                                          PricingRuleRequestDto requestDto);

    // Get all pricing rules of a turf
    List<PricingRuleResponseDto> getPricingRulesByTurf(Long turfId);

    // Get pricing rule by id
    PricingRuleResponseDto getPricingRuleById(Long pricingRuleId);

    // Update pricing rule
    PricingRuleResponseDto updatePricingRule(Long pricingRuleId,
                                             PricingRuleRequestDto requestDto);

    // Delete pricing rule
    String deletePricingRule(Long pricingRuleId);

    // Enable / Disable pricing rule
    String updatePricingRuleStatus(Long pricingRuleId, Boolean active);

    // Calculate slot price (used in Booking module)
    Double calculateSlotPrice(Long turfId,
                              LocalDate bookingDate,
                              LocalTime slotStartTime);

	String deleteAllPricingRulesByTurf(Long turfId);
}