 package com.turfbooking.service;

import java.time.LocalDate;
import java.util.List;

import com.turfbooking.dto.slot.SlotResponseDto;

public interface SlotService {

    // Generate slots for a turf on a specific date
    String generateSlots(Long turfId, LocalDate slotDate);

    // Get all slots for a turf on a particular date
    List<SlotResponseDto> getSlotsByTurf(Long turfId, LocalDate slotDate);

    // Get only available slots
    List<SlotResponseDto> getAvailableSlots(Long turfId, LocalDate slotDate);

    // Update slot status (AVAILABLE, BOOKED, BLOCKED)
    String updateSlotStatus(Long slotId, String status);

    // Delete slots for a particular date
    String deleteSlots(Long turfId, LocalDate slotDate);
}