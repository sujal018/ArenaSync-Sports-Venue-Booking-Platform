package com.turfbooking.dto.turf;

import com.turfbooking.enums.SportType;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

@Data
public class TurfSearchDto {

    // Optional
    private String city;

    // Optional
    private SportType sportType;

    // Optional
    @DecimalMin(value = "0.0", message = "Minimum price cannot be negative")
    private Double minPrice;

    // Optional
    @DecimalMin(value = "0.0", message = "Maximum price cannot be negative")
    private Double maxPrice;

    // Optional
    @DecimalMin(value = "0.0", message = "Minimum rating cannot be negative")
    private Double minRating;
}