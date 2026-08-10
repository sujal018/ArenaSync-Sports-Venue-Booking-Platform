package com.turfbooking.dto.payment;

import lombok.Data;

@Data
public class PaymentVerificationDto {

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;

}