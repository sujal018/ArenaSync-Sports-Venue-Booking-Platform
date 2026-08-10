package com.turfbooking.dto.payment;

import java.time.LocalDateTime;

import com.turfbooking.enums.PaymentStatus;

import lombok.Data;

@Data
public class PaymentResponseDto {

    private Long paymentId;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private PaymentStatus paymentStatus;

    private LocalDateTime createdOn;
}