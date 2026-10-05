package com.turfbooking.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import com.turfbooking.entity.Slot;
import com.turfbooking.enums.SlotStatus;

public interface SlotRepository extends JpaRepository<Slot, Long> {

  
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Slot s WHERE s.id = :id")
    Optional<Slot> findByIdForUpdate(@Param("id") Long id);

    // Check if a slot already exists
    boolean existsByTurfIdAndSlotDateAndStartTime(
            Long turfId,
            LocalDate slotDate,
            LocalTime startTime
    );

    // Get all slots for a turf on a specific date
    List<Slot> findByTurfIdAndSlotDateOrderByStartTimeAsc(
            Long turfId,
            LocalDate slotDate
    );

    // Get available slots
    List<Slot> findByTurfIdAndSlotDateAndStatusOrderByStartTimeAsc(
            Long turfId,
            LocalDate slotDate,
            SlotStatus status
    );

    // Check if slot already booked/blocked
    List<Slot> findByStatus(SlotStatus status);

    // Delete all slots for a turf
    void deleteByTurfId(Long turfId);

    // Delete slots for a specific date
    void deleteByTurfIdAndSlotDate(
            Long turfId,
            LocalDate slotDate
    );
}
