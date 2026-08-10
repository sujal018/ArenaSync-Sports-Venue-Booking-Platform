package com.turfbooking.dto.admin;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class DashboardResponseDto {

    private Long totalUsers;

    private Long totalOwners;

    private Long totalCustomers;

    private Long totalTurfs;

    private Long activeTurfs;

    private Long totalBookings;

    private Long confirmedBookings;

    private Long cancelledBookings;

    private Long todayBookings;

    private BigDecimal totalRevenue;

    private BigDecimal totalPlatformCommission;
}