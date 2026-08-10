package com.turfbooking.dto.slot;


import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SlotRequestDto {

    @NotNull(message = "Slot date is required")
    private LocalDate slotDate;

}