package com.turfbooking.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.turfbooking.dto.review.ReviewRequestDto;
import com.turfbooking.dto.review.ReviewResponseDto;
import com.turfbooking.entity.Booking;
import com.turfbooking.entity.Review;
import com.turfbooking.entity.Turf;
import com.turfbooking.entity.User;
import com.turfbooking.enums.BookingStatus;
import com.turfbooking.exception.ResourceNotFoundException;
import com.turfbooking.repository.BookingRepository;
import com.turfbooking.repository.ReviewRepository;
import com.turfbooking.repository.TurfRepository;
import com.turfbooking.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final TurfRepository turfRepository; 

    @Override
    public ReviewResponseDto addReview(Long bookingId,
                                       ReviewRequestDto dto) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User customer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException(
                    "You cannot review someone else's booking.");
        }

        if (booking.getBookingStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException(
                    "Only confirmed bookings can be reviewed.");
        }

        if (reviewRepository.findByBookingId(bookingId).isPresent()) {
            throw new RuntimeException(
                    "Review already submitted.");
        }
        Turf turf = booking.getBookingDetails()
                .get(0)
                .getSlot()
                .getTurf();

        Review review = new Review();

        review.setBooking(booking);
        review.setCustomer(customer);
        review.setTurf(
                booking.getBookingDetails()
                        .get(0)
                        .getSlot()
                        .getTurf());

        review.setRating(dto.getRating());
        review.setReview(dto.getReview());

        Review savedReview = reviewRepository.save(review);

        booking.setReview(savedReview);
        updateTurfRatingStats(turf);
        return mapToDto(savedReview);
    }
    
    @Override
    public ReviewResponseDto updateReview(Long reviewId,
                                          ReviewRequestDto dto) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Review not found"));

        review.setRating(dto.getRating());
        review.setReview(dto.getReview());
        updateTurfRatingStats(review.getTurf());
        return mapToDto(reviewRepository.save(review));
    }

    @Override
    public String deleteReview(Long reviewId) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Review not found"));

        reviewRepository.delete(review);

        return "Review deleted successfully.";
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDto> getReviewsByTurf(Long turfId) {

        return reviewRepository.findByTurfId(turfId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponseDto getReviewByBooking(Long bookingId) {

        Review review = reviewRepository.findByBookingId(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Review not found"));

        return mapToDto(review);
    }
    
    private ReviewResponseDto mapToDto(Review review) {

        ReviewResponseDto dto = new ReviewResponseDto();

        dto.setReviewId(review.getId());
        dto.setRating(review.getRating());
        dto.setReview(review.getReview());

        dto.setCustomerName(
                review.getCustomer().getFirstName()
                        + " "
                        + review.getCustomer().getLastName());

        dto.setTurfName(
                review.getTurf().getTurfName());

        dto.setCreatedOn(review.getCreatedOn());

        return dto;
    }
    
    private void updateTurfRatingStats(Turf turf) {
        if (turf == null) return;
        List<Review> reviews = reviewRepository.findByTurfId(turf.getId());
        if (reviews.isEmpty()) {
            turf.setAverageRating(0.0);
            turf.setTotalReviews(0);
        } else {
            double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
            turf.setAverageRating(Math.round(avg * 10.0) / 10.0);
            turf.setTotalReviews(reviews.size());
        }
        turfRepository.save(turf);
    }

}