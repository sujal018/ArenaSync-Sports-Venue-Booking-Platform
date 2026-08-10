package com.turfbooking.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.turfbooking.dto.review.ReviewRequestDto;
import com.turfbooking.dto.review.ReviewResponseDto;
import com.turfbooking.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/{bookingId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponseDto> addReview(
            @PathVariable Long bookingId,
            @Valid @RequestBody ReviewRequestDto dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.addReview(bookingId, dto));
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponseDto> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequestDto dto) {

        return ResponseEntity.ok(
                reviewService.updateReview(reviewId, dto));
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')")
    public ResponseEntity<String> deleteReview(
            @PathVariable Long reviewId) {

        return ResponseEntity.ok(
                reviewService.deleteReview(reviewId));
    }

    @GetMapping("/turf/{turfId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByTurf(
            @PathVariable Long turfId) {

        return ResponseEntity.ok(
                reviewService.getReviewsByTurf(turfId));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ReviewResponseDto> getReviewByBooking(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                reviewService.getReviewByBooking(bookingId));
    }
}