package com.turfbooking.service;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.turfbooking.dto.admin.DashboardResponseDto;
import com.turfbooking.enums.BookingStatus;
import com.turfbooking.enums.TurfStatus;
import com.turfbooking.enums.UserRole;
import com.turfbooking.repository.BookingRepository;
import com.turfbooking.repository.TurfRepository;
import com.turfbooking.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final TurfRepository turfRepository;
    private final BookingRepository bookingRepository;

    @Override
    public DashboardResponseDto getDashboard() {

        DashboardResponseDto dto = new DashboardResponseDto();

        dto.setTotalUsers(userRepository.count());

        dto.setTotalOwners(
                userRepository.countByRole(UserRole.OWNER));

        dto.setTotalCustomers(
                userRepository.countByRole(UserRole.CUSTOMER));

        dto.setTotalTurfs(
                turfRepository.count());

        dto.setActiveTurfs(
                turfRepository.countByStatus(
                        TurfStatus.APPROVED));

        dto.setTotalBookings(
                bookingRepository.count());

        dto.setConfirmedBookings(
                bookingRepository.countByBookingStatus(
                        BookingStatus.CONFIRMED));

        dto.setCancelledBookings(
                bookingRepository.countByBookingStatus(
                        BookingStatus.CANCELLED));

        LocalDate today = LocalDate.now();

        dto.setTodayBookings(
                bookingRepository.countByBookingDateBetween(
                        today.atStartOfDay(),
                        today.plusDays(1).atStartOfDay()));

        BigDecimal revenue = bookingRepository.getTotalRevenue();
        dto.setTotalRevenue(
                revenue == null ? BigDecimal.ZERO : revenue);

        BigDecimal commission =
                bookingRepository.getPlatformRevenue();

        dto.setTotalPlatformCommission(
                commission == null
                        ? BigDecimal.ZERO
                        : commission);

        return dto;
    }
    @Override
    public Double getDefaultCommission() {
        return BookingServiceImpl.getGlobalDefaultCommissionPercentage();
    }

    @Override
    public String updateDefaultCommission(Double percentage) {
        if (percentage != null && (percentage < 0 || percentage > 100)) {
            throw new IllegalArgumentException("Commission percentage must be between 0 and 100.");
        }
        BookingServiceImpl.setGlobalDefaultCommissionPercentage(percentage);
        return "Global default platform commission updated to " + percentage + "% successfully.";
    }
}