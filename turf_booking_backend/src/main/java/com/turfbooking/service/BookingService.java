package com.turfbooking.service;

import java.util.List;

import com.turfbooking.dto.booking.BookingDto;
import com.turfbooking.dto.booking.BookingRequestDto;
import com.turfbooking.dto.booking.BookingResponseDto;
import com.turfbooking.dto.payment.CreateOrderResponseDto;

public interface BookingService {

	BookingResponseDto createBooking(BookingRequestDto requestDto);

	CreateOrderResponseDto initiatePayment(Long bookingId);

	BookingResponseDto getBookingById(Long bookingId);

	BookingResponseDto getBookingByBookingNumber(String bookingNumber);

	List<BookingResponseDto> getMyBookings();

	List<BookingResponseDto> getBookingsByOwner(Long ownerId);

	List<BookingResponseDto> getBookingsByTurf(Long turfId);

	String cancelBooking(Long bookingId);
	 BookingDto getBookingForPayment(Long bookingId);

	    void paymentSuccess(Long bookingId,String razorpayOrderId, String transactionId);

	    void paymentFailed(Long bookingId);

}