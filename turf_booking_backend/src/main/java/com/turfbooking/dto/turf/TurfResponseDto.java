package com.turfbooking.dto.turf;

import java.time.LocalDateTime;
import java.time.LocalTime;

import com.turfbooking.enums.SportType;
import com.turfbooking.enums.TurfStatus;
import com.turfbooking.enums.UserStatus;

import lombok.Data;

@Data
public class TurfResponseDto {

    private Long id;

    private String turfName;

    private String description;

    private String address;

    private String city;

    private String state;

    private String googleMapUrl;

   

    private LocalTime openingTime;

    private LocalTime closingTime;

    private Integer slotDuration;

    private Double basePrice;

    private SportType sportType;

    private String amenities;

    private Double averageRating;

    private Integer totalReviews;

    private TurfStatus status;

    private Double customCommissionPercentage;

    private LocalDateTime createdOn;

    private String ownerName;

    private UserStatus ownerStatus;
}