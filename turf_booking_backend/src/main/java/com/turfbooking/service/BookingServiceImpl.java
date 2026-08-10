package com.turfbooking.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.turfbooking.dto.booking.BookingDetailResponseDto;
import com.turfbooking.dto.booking.BookingDto;
import com.turfbooking.dto.booking.BookingRequestDto;
import com.turfbooking.dto.booking.BookingResponseDto;
import com.turfbooking.dto.payment.CreateOrderRequestDto;
import com.turfbooking.dto.payment.CreateOrderResponseDto;
import com.turfbooking.entity.Booking;
import com.turfbooking.entity.BookingDetail;
import com.turfbooking.entity.Slot;
import com.turfbooking.entity.User;
import com.turfbooking.enums.BookingStatus;
import com.turfbooking.enums.PaymentStatus;
import com.turfbooking.enums.SlotStatus;
import com.turfbooking.exception.ResourceNotFoundException;
import com.turfbooking.feign.PaymentFeignClient;
import com.turfbooking.repository.BookingDetailRepository;
import com.turfbooking.repository.BookingRepository;
import com.turfbooking.repository.SlotRepository;
import com.turfbooking.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingServiceImpl implements BookingService {

	private final BookingRepository bookingRepository;
	private final BookingDetailRepository bookingDetailRepository;
	private final SlotRepository slotRepository;
	private final UserRepository userRepository;
	private final PricingRuleService pricingRuleService;
	private final ModelMapper modelMapper;
	private final PaymentFeignClient paymentFeignClient;

	/**
	 * Generate Booking Number Example : TB1753523569874
	 */
	private String generateBookingNumber() {
		return "TB" + System.currentTimeMillis();
	}

	private static Double globalDefaultCommissionPercentage = 10.0;

	public static Double getGlobalDefaultCommissionPercentage() {
		return globalDefaultCommissionPercentage;
	}

	public static void setGlobalDefaultCommissionPercentage(Double percentage) {
		if (percentage != null && percentage >= 0 && percentage <= 100) {
			globalDefaultCommissionPercentage = percentage;
		}
	}

	@Override
	public BookingResponseDto createBooking(BookingRequestDto requestDto) {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		String email = authentication.getName();

		User customer = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

		Booking booking = new Booking();

		booking.setBookingNumber(generateBookingNumber());
		booking.setCustomer(customer);
		booking.setBookingStatus(BookingStatus.PENDING_PAYMENT);
		booking.setPaymentStatus(PaymentStatus.PENDING);

		BigDecimal totalAmount = BigDecimal.ZERO;

		List<BookingDetailResponseDto> detailDtos = new ArrayList<>();
		// 1. GET CURRENT DATE AND TIME
		LocalDate today = LocalDate.now();
		LocalTime now = LocalTime.now();

		for (Long slotId : requestDto.getSlotIds()) {

			// Row-level lock: blocks a second concurrent request for the
			// same slot until this transaction commits or rolls back.
			Slot slot = slotRepository.findByIdForUpdate(slotId)
					.orElseThrow(() -> new ResourceNotFoundException("Slot not found : " + slotId));

			// 2. ADDED PAST TIME SLOT VALIDATION HERE
			if (slot.getSlotDate().isBefore(today)
					|| (slot.getSlotDate().equals(today) && slot.getStartTime().isBefore(now))) {
				throw new IllegalArgumentException(
						"Cannot book time slot (" + slot.getStartTime() + ") that has already passed.");
			}

			if (slot.getStatus() != SlotStatus.AVAILABLE) {
				throw new IllegalArgumentException("Slot already booked or blocked.");
			}

			/*
			 * Mark the slot BOOKED right now, inside this same transaction. The original
			 * code left the slot AVAILABLE until payment was verified, so a second customer
			 * could browse and book the same slot while the first customer's payment was
			 * still in progress. If the payment fails or the booking is cancelled,
			 * cancelBooking() already reverts the slot back to AVAILABLE.
			 */
			slot.setStatus(SlotStatus.BOOKED);
			slotRepository.save(slot);

			Double amount = pricingRuleService.calculateSlotPrice(slot.getTurf().getId(), slot.getSlotDate(),
					slot.getStartTime());

			BigDecimal slotPrice = BigDecimal.valueOf(amount);

			totalAmount = totalAmount.add(slotPrice);

			BookingDetail bookingDetail = new BookingDetail();

			bookingDetail.setBooking(booking);
			bookingDetail.setSlot(slot);
			bookingDetail.setSlotPrice(slotPrice);

			booking.addBookingDetail(bookingDetail);

			BookingDetailResponseDto detailDto = new BookingDetailResponseDto();

			detailDto.setSlotId(slot.getId());
			detailDto.setTurfName(slot.getTurf().getTurfName());
			detailDto.setSlotDate(slot.getSlotDate());
			detailDto.setStartTime(slot.getStartTime());
			detailDto.setEndTime(slot.getEndTime());
			detailDto.setSlotPrice(slotPrice);

			detailDtos.add(detailDto);
		}

		/*
		 * Platform Commission Uses Turf custom commission if available.
		 */

		Double commissionPercentage = booking.getBookingDetails().get(0).getSlot().getTurf()
				.getCustomCommissionPercentage();

		if (commissionPercentage == null) {
			commissionPercentage = getGlobalDefaultCommissionPercentage(); // Uses editable default fee %
		}
		BigDecimal commission = totalAmount.multiply(BigDecimal.valueOf(commissionPercentage))
				.divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

		booking.setTotalAmount(totalAmount);
		booking.setPlatformCommission(commission);

		Booking savedBooking = bookingRepository.save(booking);

		BookingResponseDto responseDto = new BookingResponseDto();

		responseDto.setBookingId(savedBooking.getId());
		responseDto.setBookingNumber(savedBooking.getBookingNumber());
		responseDto.setCustomerName(
				savedBooking.getCustomer().getFirstName() + " " + savedBooking.getCustomer().getLastName());

		responseDto.setBookingDate(savedBooking.getBookingDate());
		responseDto.setBookingStatus(savedBooking.getBookingStatus());
		responseDto.setTotalAmount(savedBooking.getTotalAmount());
		responseDto.setPlatformCommission(savedBooking.getPlatformCommission());
		responseDto.setBookingDetails(detailDtos);

		return responseDto;
	}

	@Override
	@Transactional(readOnly = true)
	public BookingResponseDto getBookingById(Long bookingId) {

		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

		return mapToResponseDto(booking);
	}

	@Override
	@Transactional(readOnly = true)
	public BookingResponseDto getBookingByBookingNumber(String bookingNumber) {

		Booking booking = bookingRepository.findByBookingNumber(bookingNumber)
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

		return mapToResponseDto(booking);
	}

	@Override
	@Transactional(readOnly = true)
	public List<BookingResponseDto> getMyBookings() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		String email = authentication.getName();

		User customer = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Customer not found."));

		return bookingRepository.findByCustomerId(customer.getId()).stream().map(this::mapToResponseDto).toList();
	}

	@Override
	public String cancelBooking(Long bookingId) {

		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

		if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
			throw new IllegalArgumentException("Booking is already cancelled.");
		}

		booking.setBookingStatus(BookingStatus.CANCELLED);
		booking.setPaymentStatus(PaymentStatus.REFUNDED);

		/*
		 * Release booked slots
		 */

		booking.getBookingDetails().forEach(detail -> {

			Slot slot = detail.getSlot();

			slot.setStatus(SlotStatus.AVAILABLE);

			slotRepository.save(slot);
		});

		bookingRepository.save(booking);

		return "Booking cancelled successfully.";
	}

	@Override
	@Transactional(readOnly = true)
	public CreateOrderResponseDto initiatePayment(Long bookingId) {

		System.out.println("inside CreateOrderResponseDto"+bookingId);
		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
		

		if (booking.getBookingStatus() != BookingStatus.PENDING_PAYMENT) {
			throw new IllegalArgumentException("Payment can only be initiated for a booking that is pending payment.");
		}

		CreateOrderRequestDto orderRequest = new CreateOrderRequestDto();

		orderRequest.setBookingId(booking.getId());

		return paymentFeignClient.createOrder(orderRequest);
	}

	/*
	 * ====================================================== Helper Method
	 * ======================================================
	 */

	private BookingResponseDto mapToResponseDto(Booking booking) {

		BookingResponseDto dto = new BookingResponseDto();

		dto.setBookingId(booking.getId());
		dto.setBookingNumber(booking.getBookingNumber());

		dto.setCustomerName(booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName());

		dto.setBookingDate(booking.getBookingDate());

		dto.setBookingStatus(booking.getBookingStatus());

		dto.setTotalAmount(booking.getTotalAmount());

		dto.setPlatformCommission(booking.getPlatformCommission());

		List<BookingDetailResponseDto> detailDtos = booking.getBookingDetails().stream().map(detail -> {

			BookingDetailResponseDto detailDto = new BookingDetailResponseDto();

			detailDto.setBookingDetailId(detail.getId());
			detailDto.setSlotId(detail.getSlot().getId());
			detailDto.setTurfName(detail.getSlot().getTurf().getTurfName());
			detailDto.setSlotDate(detail.getSlot().getSlotDate());
			detailDto.setStartTime(detail.getSlot().getStartTime());
			detailDto.setEndTime(detail.getSlot().getEndTime());
			detailDto.setSlotPrice(detail.getSlotPrice());

			return detailDto;

		}).toList();

		dto.setBookingDetails(detailDtos);

		return dto;
	}

	@Override
	@Transactional(readOnly = true)
	public List<BookingResponseDto> getBookingsByOwner(Long ownerId) {
		return bookingRepository.findByOwnerId(ownerId).stream().map(this::mapToResponseDto).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<BookingResponseDto> getBookingsByTurf(Long turfId) {
		return bookingRepository.findByTurfId(turfId).stream().map(this::mapToResponseDto).toList();
	}

	@Override
	public BookingDto getBookingForPayment(Long bookingId) {
		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

		BookingDto dto = new BookingDto();

		dto.setId(booking.getId());
		dto.setBookingNumber(booking.getBookingNumber());
		dto.setTotalAmount(booking.getTotalAmount());
		dto.setStatus(booking.getBookingStatus().name());

		return dto;
	}

	@Override

	@Transactional
	public void paymentSuccess(Long bookingId,String razorpayOrderId, String transactionId) {

		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

		booking.setBookingStatus(BookingStatus.CONFIRMED);
		booking.setPaymentStatus(PaymentStatus.SUCCESS);;

	    if (razorpayOrderId != null && !razorpayOrderId.isBlank()) {
	        booking.setRazorpayOrderId(razorpayOrderId);
	    }
	    if (transactionId != null && !transactionId.isBlank()) {
	        booking.setTransactionId(transactionId);
	    }
		bookingRepository.save(booking);
	}

	@Override
	@Transactional
	public void paymentFailed(Long bookingId) {

		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

		booking.setBookingStatus(BookingStatus.CANCELLED);
		booking.setPaymentStatus(PaymentStatus.FAILED);

		booking.getBookingDetails().forEach(detail -> {

			Slot slot = detail.getSlot();

			slot.setStatus(SlotStatus.AVAILABLE);

			slotRepository.save(slot);
		});

		bookingRepository.save(booking);
	}

}