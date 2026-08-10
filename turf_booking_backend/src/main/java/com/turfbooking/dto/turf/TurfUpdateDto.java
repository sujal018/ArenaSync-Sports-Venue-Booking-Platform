package com.turfbooking.dto.turf;

import java.time.LocalTime;

import com.turfbooking.enums.SportType;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class TurfUpdateDto {

    private String turfName;

    private String description;

    private String address;

    private String city;

    private String state;

    private String googleMapUrl;


    private LocalTime openingTime;

    private LocalTime closingTime;

    @Positive(message = "Slot duration must be greater than 0")
    private Integer slotDuration;

    @Positive(message = "Base price must be greater than 0")
    private Double basePrice;

    private SportType sportType;

    private String amenities;

    @DecimalMin(value = "0.0", message = "Commission must be at least 0")
    @DecimalMax(value = "100.0", message = "Commission cannot exceed 100")
    private Double customCommissionPercentage;
}