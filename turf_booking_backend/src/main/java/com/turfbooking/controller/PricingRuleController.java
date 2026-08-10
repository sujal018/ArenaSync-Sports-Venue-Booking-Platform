package com.turfbooking.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.turfbooking.dto.pricing.PricingRuleRequestDto;
import com.turfbooking.dto.pricing.PricingRuleResponseDto;
import com.turfbooking.service.PricingRuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pricing-rules")
@RequiredArgsConstructor
public class PricingRuleController {

    private final PricingRuleService pricingRuleService;

    @PostMapping("/{turfId}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<PricingRuleResponseDto> addPricingRule(
            @PathVariable Long turfId,
            @Valid @RequestBody PricingRuleRequestDto requestDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pricingRuleService.addPricingRule(turfId, requestDto));
    }

    @GetMapping("/turf/{turfId}")
    public ResponseEntity<List<PricingRuleResponseDto>> getPricingRulesByTurf(
            @PathVariable Long turfId) {
        return ResponseEntity.ok(pricingRuleService.getPricingRulesByTurf(turfId));
    }

    @GetMapping("/{pricingRuleId}")
    public ResponseEntity<PricingRuleResponseDto> getPricingRuleById(
            @PathVariable Long pricingRuleId) {
        return ResponseEntity.ok(pricingRuleService.getPricingRuleById(pricingRuleId));
    }

    @PutMapping("/{pricingRuleId}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<PricingRuleResponseDto> updatePricingRule(
            @PathVariable Long pricingRuleId,
            @Valid @RequestBody PricingRuleRequestDto requestDto) {
        return ResponseEntity.ok(pricingRuleService.updatePricingRule(pricingRuleId, requestDto));
    }

    @PatchMapping("/{pricingRuleId}/status")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<String> updatePricingRuleStatus(
            @PathVariable Long pricingRuleId,
            @RequestParam Boolean active) {
        return ResponseEntity.ok(pricingRuleService.updatePricingRuleStatus(pricingRuleId, active));
    }

    @DeleteMapping("/{pricingRuleId}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<String> deletePricingRule(
            @PathVariable Long pricingRuleId) {
        return ResponseEntity.ok(pricingRuleService.deletePricingRule(pricingRuleId));
    }

    @DeleteMapping("/turf/{turfId}/reset")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<String> deleteAllPricingRulesByTurf(
            @PathVariable Long turfId) {
        return ResponseEntity.ok(pricingRuleService.deleteAllPricingRulesByTurf(turfId));
    }
}