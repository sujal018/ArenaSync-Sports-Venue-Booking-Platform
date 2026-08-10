package com.turfbooking.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.turfbooking.enums.BookingStatus;
import com.turfbooking.enums.PaymentStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Example: TB202607260001
    @Column(nullable = false, unique = true, length = 30)
    private String bookingNumber;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime bookingDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal platformCommission;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus bookingStatus = BookingStatus.PENDING_PAYMENT;

    @UpdateTimestamp
    private LocalDateTime updatedOn;

    /*
     * ==========================
     * Relationships
     * ==========================
     */

    // Customer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    // Multiple booked slots
    @OneToMany(
            mappedBy = "booking",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    private List<BookingDetail> bookingDetails = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    @Column(length = 100)
    private String razorpayOrderId;

    @Column(length = 100)
    private String transactionId;


    // One Review (Optional)
    @OneToOne(
            mappedBy = "booking",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private Review review;

    /*
     * ==========================
     * Helper Methods
     * ==========================
     */

    public void addBookingDetail(BookingDetail bookingDetail) {
        bookingDetails.add(bookingDetail);
        bookingDetail.setBooking(this);
    }

    public void removeBookingDetail(BookingDetail bookingDetail) {
        bookingDetails.remove(bookingDetail);
        bookingDetail.setBooking(null);
    }
}