package com.turfbooking.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.turfbooking.dto.turf.TurfRequestDto;
import com.turfbooking.dto.turf.TurfSearchDto;
import com.turfbooking.dto.turf.TurfUpdateDto;
import com.turfbooking.enums.TurfStatus;
import com.turfbooking.service.TurfService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/turfs")
@RequiredArgsConstructor
@Validated
public class TurfController {
	  private final TurfService turfService;

	    @PostMapping
	    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
	    public ResponseEntity<?> addTurf(@Valid @RequestBody TurfRequestDto requestDto) {
	        return ResponseEntity
	                .status(HttpStatus.CREATED)
	                .body(turfService.addTurf(requestDto));
	    }
	    
	    @GetMapping
	    public ResponseEntity<?> getAllTurfs() {
	        return ResponseEntity.ok(turfService.getAllTurfs());
	    }
	    
	    

	    @GetMapping("/{turfId}")
	    public ResponseEntity<?> getTurfById(@PathVariable Long turfId) {
	        return ResponseEntity.ok(turfService.getTurfById(turfId));
	    }

	    
	    
	    @GetMapping("/city/{city}")
	    public ResponseEntity<?> getTurfsByCity(
	            @PathVariable String city) {

	        return ResponseEntity.ok(turfService.getTurfsByCity(city));
	    }
	    @GetMapping("/owner/{ownerId}")
	    public ResponseEntity<?> getTurfsByOwner(
	            @PathVariable Long ownerId) {

	        return ResponseEntity.ok(turfService.getTurfsByOwner(ownerId));
	    }
	    
	    @PostMapping("/search")
	    public ResponseEntity<?> searchTurfs(
	            @RequestBody TurfSearchDto searchDto) {

	        return ResponseEntity.ok(turfService.searchTurfs(searchDto));
	    }


	    @PutMapping("/{turfId}")
	    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
	    public ResponseEntity<String> updateTurf(
	            @PathVariable Long turfId,
	            @RequestBody TurfUpdateDto updateDto) {

	        return ResponseEntity.ok(turfService.updateTurf(turfId, updateDto));
	    }

	    @PatchMapping("/{turfId}/status/{status}")
	    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
	    public ResponseEntity<String> updateStatus(
	            @PathVariable Long turfId,
	            @PathVariable TurfStatus status) {

	        return ResponseEntity.ok(turfService.updateStatus(turfId, status));
	    }
	 // Admin-only endpoint to set custom platform fee / commission % cut for a turf
	    @PatchMapping("/{turfId}/commission")
	    @PreAuthorize("hasRole('ADMIN')")
	    public ResponseEntity<String> updateCommission(
	            @PathVariable Long turfId,
	            @RequestParam(required = false) Double percentage) {

	        return ResponseEntity.ok(turfService.updateCommission(turfId, percentage));
	    }
}
