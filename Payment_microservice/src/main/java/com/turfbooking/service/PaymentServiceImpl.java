package com.turfbooking.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.turfbooking.dto.payment.*;
import com.turfbooking.entity.Payment;
import com.turfbooking.enums.PaymentStatus;
import com.turfbooking.exception.ResourceNotFoundException;
import com.turfbooking.feign.BookingFeignClient;
import com.turfbooking.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingFeignClient bookingFeignClient;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Override
    public CreateOrderResponseDto createOrder(
            CreateOrderRequestDto dto) {

        try {

            BookingDto booking =
                    bookingFeignClient.getBookingById(
                            dto.getBookingId());

            RazorpayClient razorpay =
                    new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest =
                    new JSONObject();

            orderRequest.put(
                    "amount",
                    booking.getTotalAmount()
                            .multiply(java.math.BigDecimal.valueOf(100))
                            .intValue());

            orderRequest.put(
                    "currency",
                    "INR");

            orderRequest.put(
                    "receipt",
                    booking.getBookingNumber());

            Order order =
                    razorpay.orders.create(orderRequest);

            Payment payment = new Payment();

            payment.setBookingId(
                    booking.getId());

            payment.setAmount(
                    booking.getTotalAmount().doubleValue());

            payment.setPaymentStatus(
                    PaymentStatus.PENDING);

            payment.setPaymentMethod(
                    "RAZORPAY");

            payment.setRazorpayOrderId(
                    order.get("id"));

            paymentRepository.save(payment);

            CreateOrderResponseDto response =
                    new CreateOrderResponseDto();

            response.setAmount(
                    booking.getTotalAmount());

            response.setCurrency(
                    "INR");

            response.setKey(
                    keyId);

            response.setRazorpayOrderId(
                    order.get("id"));

            return response;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to create Razorpay order",
                    e);
        }
    }

    @Override
    public PaymentResponseDto verifyPayment(
            PaymentVerificationDto dto) {

        try {

            JSONObject options =
                    new JSONObject();

            options.put(
                    "razorpay_order_id",
                    dto.getRazorpayOrderId());

            options.put(
                    "razorpay_payment_id",
                    dto.getRazorpayPaymentId());

            options.put(
                    "razorpay_signature",
                    dto.getRazorpaySignature());

            boolean valid =
                    Utils.verifyPaymentSignature(
                            options,
                            keySecret);

            if (!valid) {
                throw new RuntimeException(
                        "Invalid Razorpay Signature");
            }

            Payment payment =
                    paymentRepository
                            .findByRazorpayOrderId(
                                    dto.getRazorpayOrderId())
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Payment not found"));

            payment.setPaymentStatus(
                    PaymentStatus.SUCCESS);

            payment.setRazorpayPaymentId(
                    dto.getRazorpayPaymentId());

            payment.setRazorpaySignature(
                    dto.getRazorpaySignature());

            // 1. Set transaction_id in payments table
            payment.setTransactionId(
                    dto.getRazorpayPaymentId());

            // 2. Pass razorpayOrderId & transactionId to core service via Feign
            bookingFeignClient.paymentSuccess(
                    payment.getBookingId(),
                    payment.getRazorpayOrderId(),
                    payment.getRazorpayPaymentId());

            paymentRepository.save(payment);

            PaymentResponseDto response =
                    new PaymentResponseDto();

            response.setPaymentId(
                    payment.getId());

            response.setPaymentStatus(
                    payment.getPaymentStatus());

            response.setRazorpayOrderId(
                    payment.getRazorpayOrderId());

            response.setRazorpayPaymentId(
                    payment.getRazorpayPaymentId());

            response.setCreatedOn(
                    payment.getCreatedOn());

            return response;

        } catch (Exception e) {

            Payment payment =
                    paymentRepository
                            .findByRazorpayOrderId(
                                    dto.getRazorpayOrderId())
                            .orElse(null);

            if (payment != null) {

                payment.setPaymentStatus(
                        PaymentStatus.FAILED);

                bookingFeignClient.paymentFailed(
                        payment.getBookingId());

                paymentRepository.save(payment);
            }

            throw new RuntimeException(
                    "Payment verification failed",
                    e);
        }
    }
}