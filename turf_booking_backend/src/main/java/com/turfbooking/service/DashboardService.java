package com.turfbooking.service;

import com.turfbooking.dto.admin.DashboardResponseDto;

public interface DashboardService {

    DashboardResponseDto getDashboard();
    Double getDefaultCommission();

    String updateDefaultCommission(Double percentage);
}