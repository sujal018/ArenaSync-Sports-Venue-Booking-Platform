package com.turfbooking.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.turfbooking.dto.payment.CreateOrderRequestDto;
import com.turfbooking.dto.payment.CreateOrderResponseDto;

/*
 * Calls the payment-service to create a Razorpay order for a booking.
 * This is an internal, service-to-service call (see payment.service.url
 * in application.properties), not something the frontend calls directly.
 */
@FeignClient(
        name = "payment-service",
        url = "${payment.service.url}"
)
public interface PaymentFeignClient {

    @PostMapping("/api/payments/create-order")
    CreateOrderResponseDto createOrder(
            @RequestBody CreateOrderRequestDto requestDto);
}
