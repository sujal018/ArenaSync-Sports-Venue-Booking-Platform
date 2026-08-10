package com.turfbooking.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Data;

@Data
public class BookingDetailResponseDto {

    private Long bookingDetailId;

    private Long slotId;

    private String turfName;

    private LocalDate slotDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private BigDecimal slotPrice;
}