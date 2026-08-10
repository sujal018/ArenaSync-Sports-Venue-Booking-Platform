package com.turfbooking.feign;



import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.turfbooking.dto.payment.BookingDto;


@FeignClient(
        name = "booking-service",
        url = "${booking.service.url}"
)
public interface BookingFeignClient {

    @GetMapping("/api/bookings/internal/{id}")
    BookingDto getBookingById(@PathVariable Long id);

   
    @PutMapping("/api/bookings/payment-success/{id}")
    void paymentSuccess(
            @PathVariable("id") Long id,
            @RequestParam(name = "razorpayOrderId", required = false) String razorpayOrderId,
            @RequestParam(name = "transactionId", required = false) String transactionId);
    @PutMapping("/api/bookings/payment-failed/{id}")
    void paymentFailed(@PathVariable Long id);
}