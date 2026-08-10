package com.turfbooking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.turfbooking.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByTurfId(Long turfId);

    Optional<Review> findByBookingId(Long bookingId);

    List<Review> findByCustomerId(Long customerId);
}