package com.turfbooking.service;

import com.turfbooking.dto.payment.CreateOrderRequestDto;
import com.turfbooking.dto.payment.CreateOrderResponseDto;
import com.turfbooking.dto.payment.PaymentResponseDto;
import com.turfbooking.dto.payment.PaymentVerificationDto;

public interface PaymentService {

    CreateOrderResponseDto createOrder(
            CreateOrderRequestDto dto);

    PaymentResponseDto verifyPayment(
            PaymentVerificationDto dto);
}