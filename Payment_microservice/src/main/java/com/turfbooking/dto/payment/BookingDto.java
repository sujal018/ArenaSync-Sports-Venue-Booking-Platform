package com.turfbooking.dto.payment;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class BookingDto {

    private Long id;

    private String bookingNumber;

    private BigDecimal totalAmount;

    private String status;
}