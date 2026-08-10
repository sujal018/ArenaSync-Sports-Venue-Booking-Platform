package com.turfbooking.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.turfbooking.entity.Booking;
import com.turfbooking.enums.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingNumber(String bookingNumber);

    List<Booking> findByCustomerId(Long customerId);

    List<Booking> findByBookingStatus(BookingStatus bookingStatus);

    // Used by the stale-booking auto-cancel job: finds PENDING_PAYMENT
    // bookings created before the given cutoff, so their slots can be
    // released back to AVAILABLE if the customer never completed payment.
    List<Booking> findByBookingStatusAndBookingDateBefore(
            BookingStatus bookingStatus, LocalDateTime cutoff);
    
   // Limit to 50 records per query batch to prevent OutOfMemoryError
    List<Booking> findTop50ByBookingStatusAndBookingDateBefore(
            BookingStatus bookingStatus, LocalDateTime cutoff);
    
    // Fetch bookings for an owner's turfs
    @Query("SELECT DISTINCT b FROM Booking b JOIN b.bookingDetails bd JOIN bd.slot s WHERE s.turf.owner.id = :ownerId ORDER BY b.bookingDate DESC")
    List<Booking> findByOwnerId(@Param("ownerId") Long ownerId);
    // Fetch bookings for a specific turf
    @Query("SELECT DISTINCT b FROM Booking b JOIN b.bookingDetails bd JOIN bd.slot s WHERE s.turf.id = :turfId ORDER BY b.bookingDate DESC")
    List<Booking> findByTurfId(@Param("turfId") Long turfId);

    long count();

    long countByBookingStatus(BookingStatus bookingStatus);

    long countByBookingDateBetween(LocalDateTime start,
                                   LocalDateTime end);
   
    @Query("""
            SELECT COALESCE(SUM(b.totalAmount), 0)
            FROM Booking b
            WHERE b.bookingStatus != com.turfbooking.enums.BookingStatus.CANCELLED
            """)
    BigDecimal getTotalRevenue();

    @Query("""
            SELECT COALESCE(SUM(b.platformCommission), 0)
            FROM Booking b
            WHERE b.bookingStatus != com.turfbooking.enums.BookingStatus.CANCELLED
            """)
    BigDecimal getPlatformRevenue();
    @Query("""
    		SELECT b
    		FROM Booking b
    		WHERE b.bookingStatus = com.turfbooking.enums.BookingStatus.PENDING_PAYMENT
    		AND b.bookingDate <= :expiryTime
    		""")
    		List<Booking> findExpiredPendingBookings(
    		        @Param("expiryTime") LocalDateTime expiryTime);
    
    
}