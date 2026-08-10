package com.turfbooking.repository;

import java.time.DayOfWeek;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.turfbooking.entity.PricingRule;
import com.turfbooking.enums.PricingRuleType;

public interface PricingRuleRepository extends JpaRepository<PricingRule, Long> {

    // Get all pricing rules of a turf
    List<PricingRule> findByTurfId(Long turfId);

    // Get active pricing rules of a turf
    List<PricingRule> findByTurfIdAndActiveTrue(Long turfId);

    // Get rules by type
    List<PricingRule> findByTurfIdAndRuleType(
            Long turfId,
            PricingRuleType ruleType);

    // Get active rules by type
    List<PricingRule> findByTurfIdAndRuleTypeAndActiveTrue(
            Long turfId,
            PricingRuleType ruleType);

    // Check duplicate weekend rule
    boolean existsByTurfIdAndRuleTypeAndDayOfWeek(
            Long turfId,
            PricingRuleType ruleType,
            DayOfWeek dayOfWeek);
}