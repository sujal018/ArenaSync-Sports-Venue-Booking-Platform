package com.turfbooking.service;

import java.util.List;

import com.turfbooking.dto.review.ReviewRequestDto;
import com.turfbooking.dto.review.ReviewResponseDto;

public interface ReviewService {

    ReviewResponseDto addReview(Long bookingId,
                                ReviewRequestDto dto);

    ReviewResponseDto updateReview(Long reviewId,
                                   ReviewRequestDto dto);

    String deleteReview(Long reviewId);

    List<ReviewResponseDto> getReviewsByTurf(Long turfId);

    ReviewResponseDto getReviewByBooking(Long bookingId);
}