package com.turfbooking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.turfbooking.dto.admin.DashboardResponseDto;
import com.turfbooking.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponseDto> dashboard() {

        return ResponseEntity.ok(
                dashboardService.getDashboard());
    }
    @GetMapping("/commission/default")
    public ResponseEntity<Double> getDefaultCommission() {
        return ResponseEntity.ok(dashboardService.getDefaultCommission());
    }

    @PatchMapping("/commission/default")
    public ResponseEntity<String> updateDefaultCommission(@RequestParam Double percentage) {
        return ResponseEntity.ok(dashboardService.updateDefaultCommission(percentage));
    }
}