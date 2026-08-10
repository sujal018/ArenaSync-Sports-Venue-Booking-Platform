package com.turfbooking.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.turfbooking.dto.slot.SlotRequestDto;
import com.turfbooking.dto.slot.SlotResponseDto;
import com.turfbooking.service.SlotService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;

    // Generate slots for a turf
    @PostMapping("/generate/{turfId}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<String> generateSlots(
            @PathVariable Long turfId,
            @Valid @RequestBody SlotRequestDto requestDto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(slotService.generateSlots(turfId, requestDto.getSlotDate()));
    }

    // Get all slots of a turf for a specific date
    @GetMapping("/turf/{turfId}")
    public ResponseEntity<List<SlotResponseDto>> getSlotsByTurf(
            @PathVariable Long turfId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate slotDate) {

        return ResponseEntity.ok(
                slotService.getSlotsByTurf(turfId, slotDate));
    }

    // Get only available slots
    @GetMapping("/turf/{turfId}/available")
    public ResponseEntity<List<SlotResponseDto>> getAvailableSlots(
            @PathVariable Long turfId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate slotDate) {

        return ResponseEntity.ok(
                slotService.getAvailableSlots(turfId, slotDate));
    }

    // Update slot status
    @PatchMapping("/{slotId}/status/{status}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<String> updateSlotStatus(
            @PathVariable Long slotId,
            @PathVariable String status) {

        return ResponseEntity.ok(
                slotService.updateSlotStatus(slotId, status));
    }

    // Delete slots of a specific date
    @DeleteMapping("/{turfId}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<String> deleteSlots(
            @PathVariable Long turfId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate slotDate) {

        return ResponseEntity.ok(
                slotService.deleteSlots(turfId, slotDate));
    }
}