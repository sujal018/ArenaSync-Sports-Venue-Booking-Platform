package com.turfbooking.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.turfbooking.dto.turf.TurfRequestDto;
import com.turfbooking.dto.turf.TurfResponseDto;
import com.turfbooking.dto.turf.TurfSearchDto;
import com.turfbooking.dto.turf.TurfSummaryDto;
import com.turfbooking.dto.turf.TurfUpdateDto;
import com.turfbooking.entity.Turf;
import com.turfbooking.entity.User;
import com.turfbooking.enums.TurfStatus;
import com.turfbooking.enums.UserStatus;
import com.turfbooking.exception.ResourceAlreadyExistsException;
import com.turfbooking.exception.ResourceNotFoundException;
import com.turfbooking.repository.TurfRepository;
import com.turfbooking.repository.UserRepository;
import com.turfbooking.security.JwtPrincipal;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class TurfServiceImpl implements TurfService {
	private final TurfRepository turfRepository;
	private final UserRepository userRepository;
	private final ModelMapper modelMapper;

	@Override
	public String addTurf(TurfRequestDto dto) {

		String email = ((JwtPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
				.getEmail();

		User owner = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

		boolean exists = turfRepository.existsByOwnerIdAndAddressIgnoreCaseAndCityIgnoreCaseAndStateIgnoreCase(
				owner.getId(), dto.getAddress(), dto.getCity(), dto.getState());

		if (exists) {
			throw new ResourceAlreadyExistsException("You already have a turf registered at this location.");
		}

		Turf turf = modelMapper.map(dto, Turf.class);

		turf.setOwner(owner);
		turf.setStatus(TurfStatus.APPROVED);

		turfRepository.save(turf);

		return "Turf added successfully.";
	}

	@Override
	public TurfResponseDto getTurfById(Long turfId) {
		Turf turf = turfRepository.findById(turfId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("Turf not found."));

	    TurfResponseDto dto = modelMapper.map(turf, TurfResponseDto.class);

	    if (turf.getOwner() != null) {
	        dto.setOwnerName(turf.getOwner().getFirstName() + " " + turf.getOwner().getLastName());
	        dto.setOwnerStatus(turf.getOwner().getStatus());
	    }

	    return dto;
	}

	@Override
	public List<TurfResponseDto> getAllTurfs() {
	    // Returns ALL turfs for Admin dashboard regardless of status (APPROVED, SUSPENDED, PENDING)
	    return turfRepository.findAll().stream()
	            .map(turf -> {
	                TurfResponseDto dto = modelMapper.map(turf, TurfResponseDto.class);
	                if (turf.getOwner() != null) {
	                    dto.setOwnerName(turf.getOwner().getFirstName() + " " + turf.getOwner().getLastName());
	                    dto.setOwnerStatus(turf.getOwner().getStatus());
	                }
	                return dto;
	            }).toList();
	}

	@Override
	public List<TurfResponseDto> getTurfsByCity(String city) {
	    // Filters ONLY APPROVED turfs with ACTIVE owners for public customer booking
	    List<TurfResponseDto> ls = turfRepository.findByCityIgnoreCase(city)
	            .stream()
	            .filter(turf -> (turf.getStatus() == null || turf.getStatus() == TurfStatus.APPROVED)
	                    && (turf.getOwner() == null || turf.getOwner().getStatus() == null || turf.getOwner().getStatus() == UserStatus.ACTIVE))
	            .map(turf -> {
	                TurfResponseDto dto = modelMapper.map(turf, TurfResponseDto.class);
	                if (turf.getOwner() != null) {
	                    dto.setOwnerName(turf.getOwner().getFirstName() + " " + turf.getOwner().getLastName());
	                    dto.setOwnerStatus(turf.getOwner().getStatus());
	                }
	                return dto;
	            })
	            .toList();

	    if (ls.isEmpty()) {
	        throw new ResourceNotFoundException("No Turf available for city " + city);
	    }

	    return ls;
	}

	@Override
	public List<TurfResponseDto> getTurfsByOwner(Long ownerId) {

		return turfRepository.findByOwnerId(ownerId).stream().map(turf -> {
			TurfResponseDto dto = modelMapper.map(turf, TurfResponseDto.class);
			if (turf.getOwner() != null) {
				dto.setOwnerName(turf.getOwner().getFirstName() + " " + turf.getOwner().getLastName());
				dto.setOwnerStatus(turf.getOwner().getStatus());
			}
			return dto;
		}).toList();
	}

	@Override
	public List<TurfSummaryDto> searchTurfs(TurfSearchDto dto) {
		return null;
	}

	@Override
	public String updateTurf(Long turfId, TurfUpdateDto dto) {
		Turf turf = turfRepository.findById(turfId)
				.orElseThrow(() -> new ResourceNotFoundException("Turf not found with id: " + turfId));

		if (dto.getTurfName() != null && !dto.getTurfName().isBlank()) {
			turf.setTurfName(dto.getTurfName());
		}

		if (dto.getDescription() != null && !dto.getDescription().isBlank()) {
			turf.setDescription(dto.getDescription());
		}

		if (dto.getAddress() != null && !dto.getAddress().isBlank()) {
			turf.setAddress(dto.getAddress());
		}

		if (dto.getCity() != null && !dto.getCity().isBlank()) {
			turf.setCity(dto.getCity());
		}

		if (dto.getState() != null && !dto.getState().isBlank()) {
			turf.setState(dto.getState());
		}

		if (dto.getGoogleMapUrl() != null && !dto.getGoogleMapUrl().isBlank()) {
			turf.setGoogleMapUrl(dto.getGoogleMapUrl());
		}

		if (dto.getOpeningTime() != null) {
			turf.setOpeningTime(dto.getOpeningTime());
		}

		if (dto.getClosingTime() != null) {
			turf.setClosingTime(dto.getClosingTime());
		}

		if (dto.getSlotDuration() != null) {
			turf.setSlotDuration(dto.getSlotDuration());
		}

		if (dto.getSportType() != null) {
			turf.setSportType(dto.getSportType());
		}

		if (dto.getAmenities() != null && !dto.getAmenities().isBlank()) {
			turf.setAmenities(dto.getAmenities());
		}
		if (dto.getBasePrice() != null) {
		    turf.setBasePrice(dto.getBasePrice());
		}


		if (dto.getCustomCommissionPercentage() != null) {
			turf.setCustomCommissionPercentage(dto.getCustomCommissionPercentage());
		}

		turfRepository.save(turf);

		return "Turf updated successfully.";
	}

	@Override
	public String updateStatus(Long turfId, TurfStatus status) {

		Turf turf = turfRepository.findById(turfId).orElseThrow(() -> new ResourceNotFoundException("Turf not found."));

		turf.setStatus(status);

		turfRepository.save(turf);

		return "Turf status updated successfully.";
	}

	@Override
	public String deleteTurf(Long turfId) {
		return null;
	}

	@Override
	public String updateCommission(Long turfId, Double percentage) {

	    Turf turf = turfRepository.findById(turfId)
	            .orElseThrow(() -> new ResourceNotFoundException("Turf not found with id: " + turfId));

	    if (percentage != null && (percentage < 0 || percentage > 100)) {
	        throw new IllegalArgumentException("Commission percentage must be between 0 and 100.");
	    }

	    turf.setCustomCommissionPercentage(percentage);
	    turfRepository.save(turf);

	    return "Custom platform commission updated to " + (percentage == null ? "10% (Default)" : percentage + "%") + " successfully.";
	}

}