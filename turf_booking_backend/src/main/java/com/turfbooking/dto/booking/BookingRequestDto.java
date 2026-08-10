package com.turfbooking.dto.booking;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class BookingRequestDto {

    @NotEmpty(message = "Please select at least one slot.")
    private List<Long> slotIds;
}