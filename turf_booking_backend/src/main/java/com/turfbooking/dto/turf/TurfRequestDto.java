package com.turfbooking.dto.turf;

import java.time.LocalTime;

import com.turfbooking.enums.SportType;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class TurfRequestDto {

    @NotBlank(message = "Turf name is required")
    private String turfName;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    private String googleMapUrl;

    
    @NotNull(message = "Opening time is required")
    private LocalTime openingTime;

    @NotNull(message = "Closing time is required")
    private LocalTime closingTime;

    @NotNull(message = "Slot duration is required")
    @Positive(message = "Slot duration must be greater than 0")
    private Integer slotDuration;

    @NotNull(message = "Base price is required")
    @Positive(message = "Base price must be greater than 0")
    private Double basePrice;

    @NotNull(message = "Sport type is required")
    private SportType sportType;

    private String amenities;

    @DecimalMin(value = "0.0", message = "Commission must be at least 0")
    @DecimalMax(value = "100.0", message = "Commission cannot exceed 100")
    private Double customCommissionPercentage;
}