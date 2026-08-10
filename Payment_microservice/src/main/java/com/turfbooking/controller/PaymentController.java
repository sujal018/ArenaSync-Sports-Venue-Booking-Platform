package com.turfbooking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.turfbooking.dto.payment.CreateOrderRequestDto;
import com.turfbooking.dto.payment.PaymentVerificationDto;
import com.turfbooking.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // Called by booking-service (via Feign) after it has already verified
    // the caller is the CUSTOMER who owns the booking.
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @RequestBody CreateOrderRequestDto dto) {

        return ResponseEntity.ok(
                paymentService.createOrder(dto));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody PaymentVerificationDto dto) {

        return ResponseEntity.ok(
                paymentService.verifyPayment(dto));
    }
}