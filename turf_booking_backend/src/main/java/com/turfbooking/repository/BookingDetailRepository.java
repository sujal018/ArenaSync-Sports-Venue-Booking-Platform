package com.turfbooking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.turfbooking.entity.BookingDetail;

public interface BookingDetailRepository extends JpaRepository<BookingDetail, Long> {

    List<BookingDetail> findByBookingId(Long bookingId);

    List<BookingDetail> findBySlotId(Long slotId);

}