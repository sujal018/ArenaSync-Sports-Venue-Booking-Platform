package com.turfbooking.dto.turf;

import com.turfbooking.enums.SportType;

import lombok.Data;

@Data
public class TurfSummaryDto {

    private Long id;

    private String turfName;

    private String city;

    private SportType sportType;

    private Double averageRating;

    // Base price of the turf
    private Double basePrice;

    // Thumbnail image URL
    private String thumbnailImage;
}