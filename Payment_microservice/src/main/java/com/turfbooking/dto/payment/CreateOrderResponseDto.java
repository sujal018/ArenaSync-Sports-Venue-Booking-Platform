package com.turfbooking.dto.payment;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class CreateOrderResponseDto {

    private String razorpayOrderId;

    private String currency;

    private BigDecimal amount;

    private String key;

}