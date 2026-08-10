package com.turfbooking.service;

import java.util.List;

import com.turfbooking.dto.turf.TurfRequestDto;
import com.turfbooking.dto.turf.TurfResponseDto;
import com.turfbooking.dto.turf.TurfSearchDto;
import com.turfbooking.dto.turf.TurfSummaryDto;
import com.turfbooking.dto.turf.TurfUpdateDto;
import com.turfbooking.enums.TurfStatus;

public interface TurfService {

	String addTurf(TurfRequestDto dto);

	TurfResponseDto getTurfById(Long turfId);

	List<TurfResponseDto> getAllTurfs();

	List<TurfResponseDto> getTurfsByCity(String city);

	List<TurfResponseDto> getTurfsByOwner(Long ownerId);
	String updateCommission(Long turfId, Double percentage);

	List<TurfSummaryDto> searchTurfs(TurfSearchDto dto);

	String updateTurf(Long turfId, TurfUpdateDto dto);

	String updateStatus(Long turfId, TurfStatus status);

	String deleteTurf(Long turfId);
}
