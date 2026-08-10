package com.turfbooking.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.turfbooking.entity.Booking;
import com.turfbooking.entity.Slot;
import com.turfbooking.enums.BookingStatus;
import com.turfbooking.enums.SlotStatus;
import com.turfbooking.repository.BookingRepository;
import com.turfbooking.repository.SlotRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class StaleBookingCleanupJob {

    private static final Logger log =
            LoggerFactory.getLogger(StaleBookingCleanupJob.class);

    @Value("${payment.expiry.minutes}")
    private long expiryMinutes;

    private final BookingRepository bookingRepository;
    private final SlotRepository slotRepository;

    @Scheduled(fixedDelayString = "${payment.scheduler.fixed-delay}")
    @Transactional
    public void releaseExpiredPendingBookings() {

        LocalDateTime cutoff =
                LocalDateTime.now().minusMinutes(expiryMinutes);

        List<Booking> staleBookings =
                bookingRepository.findExpiredPendingBookings(cutoff);

        for (Booking booking : staleBookings) {

            booking.setBookingStatus(
                    BookingStatus.CANCELLED);

            booking.getBookingDetails().forEach(detail -> {

                Slot slot = detail.getSlot();

                slot.setStatus(
                        SlotStatus.AVAILABLE);

                slotRepository.save(slot);
            });

            bookingRepository.save(booking);

            log.info(
                    "Released expired booking {}",
                    booking.getBookingNumber());
        }
    }
}