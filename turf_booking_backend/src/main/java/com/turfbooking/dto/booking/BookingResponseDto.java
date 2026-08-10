package com.turfbooking.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.turfbooking.enums.BookingStatus;

import lombok.Data;

@Data
public class BookingResponseDto {

    private Long bookingId;

    private String bookingNumber;

    private String customerName;

    private BigDecimal totalAmount;

    private BigDecimal platformCommission;

    private BookingStatus bookingStatus;

    private LocalDateTime bookingDate;

    private List<BookingDetailResponseDto> bookingDetails;
}