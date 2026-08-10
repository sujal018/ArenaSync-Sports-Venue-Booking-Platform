package com.turfbooking.dto.review;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ReviewResponseDto {

    private Long reviewId;

    private Integer rating;

    private String review;

    private String customerName;

    private String turfName;

    private LocalDateTime createdOn;
}
