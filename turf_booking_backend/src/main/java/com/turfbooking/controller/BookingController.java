package com.turfbooking.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.turfbooking.dto.booking.BookingRequestDto;
import com.turfbooking.dto.booking.BookingResponseDto;
import com.turfbooking.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/*
 * NOTE: this controller did not exist in the original project.
 * BookingService/BookingServiceImpl had full booking logic implemented,
 * but there was no REST entry point to reach it, so the core booking
 * flow was unreachable from the frontend. Wiring it up here.
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // Only a logged-in customer can create a booking for themselves
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<BookingResponseDto> createBooking(
            @Valid @RequestBody BookingRequestDto requestDto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(requestDto));
    }

    @GetMapping("/{bookingId}")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','ADMIN')")
    public ResponseEntity<BookingResponseDto> getBookingById(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(bookingService.getBookingById(bookingId));
    }

    @GetMapping("/number/{bookingNumber}")
    @PreAuthorize("hasAnyRole('CUSTOMER','OWNER','ADMIN')")
    public ResponseEntity<BookingResponseDto> getBookingByBookingNumber(
            @PathVariable String bookingNumber) {

        return ResponseEntity.ok(bookingService.getBookingByBookingNumber(bookingNumber));
    }

    // Logged-in customer's own booking history
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings() {

        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    // Kicks off payment for a booking: booking-service calls payment-service
    // via Feign to create the Razorpay order, and hands the order details
    // back to the frontend to complete checkout.
    @PostMapping("/{bookingId}/initiate-payment")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> initiatePayment(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(bookingService.initiatePayment(bookingId));
    }

    @PatchMapping("/{bookingId}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId) {

        return ResponseEntity.ok(bookingService.cancelBooking(bookingId));
    }
    
    // Bookings for an owner's turfs
    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<?> getBookingsByOwner(
            @PathVariable Long ownerId) {

        return ResponseEntity.ok(bookingService.getBookingsByOwner(ownerId));
    }

    // Bookings for a specific turf
    @GetMapping("/turf/{turfId}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<?> getBookingsByTurf(
            @PathVariable Long turfId) {

        return ResponseEntity.ok(bookingService.getBookingsByTurf(turfId));
    }
    
    @GetMapping("/internal/{bookingId}")
    public ResponseEntity<?> getBookingForPayment(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                bookingService.getBookingForPayment(bookingId));
    }

    @PutMapping("/payment-success/{bookingId}")
    public ResponseEntity<Void> paymentSuccess(
            @PathVariable Long bookingId,
            @RequestParam(required = false) String razorpayOrderId,
            @RequestParam(required = false) String transactionId) {

        bookingService.paymentSuccess(bookingId, razorpayOrderId, transactionId);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/payment-failed/{bookingId}")
    public ResponseEntity<?> paymentFailed(
            @PathVariable Long bookingId) {

        bookingService.paymentFailed(bookingId);

        return ResponseEntity.ok().build();
    }
}
