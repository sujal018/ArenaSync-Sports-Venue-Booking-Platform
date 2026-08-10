package com.turfbooking.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.turfbooking.dto.pricing.PricingRuleRequestDto;
import com.turfbooking.dto.pricing.PricingRuleResponseDto;
import com.turfbooking.entity.PricingRule;
import com.turfbooking.entity.Turf;
import com.turfbooking.enums.PricingRuleType;
import com.turfbooking.exception.ResourceAlreadyExistsException;
import com.turfbooking.exception.ResourceNotFoundException;
import com.turfbooking.repository.PricingRuleRepository;
import com.turfbooking.repository.TurfRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PricingRuleServiceImpl implements PricingRuleService {

    private final PricingRuleRepository pricingRuleRepository;
    private final TurfRepository turfRepository;
    private final ModelMapper modelMapper;

    @Override
    public PricingRuleResponseDto addPricingRule(Long turfId,
            PricingRuleRequestDto requestDto) {

        Turf turf = turfRepository.findById(turfId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Turf not found with id : " + turfId));

        // Prevent duplicate weekend rule
        if (requestDto.getRuleType() == PricingRuleType.WEEKEND) {

            if (pricingRuleRepository.existsByTurfIdAndRuleTypeAndDayOfWeek(
                    turfId,
                    PricingRuleType.WEEKEND,
                    requestDto.getDayOfWeek())) {

                throw new ResourceAlreadyExistsException(
                        "Weekend pricing already exists for " + requestDto.getDayOfWeek());
            }
        }

        PricingRule rule = modelMapper.map(requestDto, PricingRule.class);

        rule.setTurf(turf);

        PricingRule savedRule = pricingRuleRepository.save(rule);

        PricingRuleResponseDto dto =
                modelMapper.map(savedRule, PricingRuleResponseDto.class);

        dto.setTurfId(turf.getId());
        dto.setTurfName(turf.getTurfName());

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PricingRuleResponseDto> getPricingRulesByTurf(Long turfId) {

        List<PricingRule> rules =
                pricingRuleRepository.findByTurfId(turfId);

        if (rules == null || rules.isEmpty()) {
            return List.of();
        }

        return rules.stream().map(rule -> {

            PricingRuleResponseDto dto =
                    modelMapper.map(rule, PricingRuleResponseDto.class);

            dto.setTurfId(rule.getTurf().getId());
            dto.setTurfName(rule.getTurf().getTurfName());

            return dto;

        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PricingRuleResponseDto getPricingRuleById(Long pricingRuleId) {

        PricingRule rule = pricingRuleRepository.findById(pricingRuleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Pricing rule not found"));

        PricingRuleResponseDto dto =
                modelMapper.map(rule, PricingRuleResponseDto.class);

        dto.setTurfId(rule.getTurf().getId());
        dto.setTurfName(rule.getTurf().getTurfName());

        return dto;
    }

    @Override
    public PricingRuleResponseDto updatePricingRule(Long pricingRuleId,
            PricingRuleRequestDto requestDto) {

        PricingRule rule = pricingRuleRepository.findById(pricingRuleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Pricing rule not found"));

        if (requestDto.getRuleType() != null) {
            rule.setRuleType(requestDto.getRuleType());
        }

        if (requestDto.getDayOfWeek() != null) {
            rule.setDayOfWeek(requestDto.getDayOfWeek());
        }

        if (requestDto.getStartTime() != null) {
            rule.setStartTime(requestDto.getStartTime());
        }

        if (requestDto.getEndTime() != null) {
            rule.setEndTime(requestDto.getEndTime());
        }

        if (requestDto.getStartDate() != null) {
            rule.setStartDate(requestDto.getStartDate());
        }

        if (requestDto.getEndDate() != null) {
            rule.setEndDate(requestDto.getEndDate());
        }

        if (requestDto.getMultiplier() != null) {
            rule.setMultiplier(requestDto.getMultiplier());
        }

        if (requestDto.getFixedPrice() != null) {
            rule.setFixedPrice(requestDto.getFixedPrice());
        }

        if (requestDto.getActive() != null) {
            rule.setActive(requestDto.getActive());
        }

        PricingRule updatedRule = pricingRuleRepository.save(rule);

        PricingRuleResponseDto dto =
                modelMapper.map(updatedRule, PricingRuleResponseDto.class);

        dto.setTurfId(updatedRule.getTurf().getId());
        dto.setTurfName(updatedRule.getTurf().getTurfName());

        return dto;
    }

    @Override
    public String deletePricingRule(Long pricingRuleId) {

        PricingRule rule = pricingRuleRepository.findById(pricingRuleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Pricing rule not found"));

        pricingRuleRepository.delete(rule);

        return "Pricing rule deleted successfully";
    }

    @Override
    public String deleteAllPricingRulesByTurf(Long turfId) {
        List<PricingRule> rules = pricingRuleRepository.findByTurfId(turfId);
        if (rules != null && !rules.isEmpty()) {
            pricingRuleRepository.deleteAll(rules);
        }
        return "All pricing rules deleted for turf id : " + turfId;
    }

    @Override
    public String updatePricingRuleStatus(Long pricingRuleId, Boolean active) {

        PricingRule rule = pricingRuleRepository.findById(pricingRuleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Pricing rule not found"));

        rule.setActive(active);

        pricingRuleRepository.save(rule);

        return "Pricing rule status updated successfully";
    }

    @Override
    @Transactional(readOnly = true)
    public Double calculateSlotPrice(Long turfId, LocalDate bookingDate, LocalTime slotStartTime) {

        Turf turf = turfRepository.findById(turfId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Turf not found with id : " + turfId));

        double finalPrice = turf.getBasePrice();

        List<PricingRule> pricingRules =
                pricingRuleRepository.findByTurfIdAndActiveTrue(turfId);

        for (PricingRule rule : pricingRules) {

            switch (rule.getRuleType()) {

            case WEEKEND:

                if (rule.getDayOfWeek() != null
                        && bookingDate.getDayOfWeek().equals(rule.getDayOfWeek())) {

                    if (rule.getFixedPrice() != null) {
                        finalPrice = rule.getFixedPrice();
                    } else if (rule.getMultiplier() != null) {
                        finalPrice *= rule.getMultiplier();
                    }
                }
                break;

            case PEAK_HOUR:

                if (rule.getStartTime() != null
                        && rule.getEndTime() != null
                        && !slotStartTime.isBefore(rule.getStartTime())
                        && slotStartTime.isBefore(rule.getEndTime())) {

                    if (rule.getFixedPrice() != null) {
                        finalPrice = rule.getFixedPrice();
                    } else if (rule.getMultiplier() != null) {
                        finalPrice *= rule.getMultiplier();
                    }
                }
                break;

            case HOLIDAY:

                if (rule.getStartDate() != null
                        && rule.getEndDate() != null
                        && !bookingDate.isBefore(rule.getStartDate())
                        && !bookingDate.isAfter(rule.getEndDate())) {

                    if (rule.getFixedPrice() != null) {
                        finalPrice = rule.getFixedPrice();
                    } else if (rule.getMultiplier() != null) {
                        finalPrice *= rule.getMultiplier();
                    }
                }
                break;

            case EVENT:

                if (rule.getStartDate() != null
                        && rule.getEndDate() != null
                        && !bookingDate.isBefore(rule.getStartDate())
                        && !bookingDate.isAfter(rule.getEndDate())) {

                    if (rule.getFixedPrice() != null) {
                        finalPrice = rule.getFixedPrice();
                    } else if (rule.getMultiplier() != null) {
                        finalPrice *= rule.getMultiplier();
                    }
                }
                break;

            default:
                break;
            }
        }

        return (double) Math.round(finalPrice);
    }
}