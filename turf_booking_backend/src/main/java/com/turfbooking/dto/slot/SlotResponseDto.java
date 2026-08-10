package com.turfbooking.dto.slot;

import java.time.LocalDate;
import java.time.LocalTime;

import com.turfbooking.enums.SlotStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SlotResponseDto {

    private Long id;

    private LocalDate slotDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private SlotStatus status;

    private Long turfId;

    private String turfName;
    private Double price; // Dynamic calculated price
}