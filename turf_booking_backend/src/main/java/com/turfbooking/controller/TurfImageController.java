package com.turfbooking.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.turfbooking.dto.turfimage.TurfImageResponseDto;
import com.turfbooking.service.TurfImageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/turf-images")
@RequiredArgsConstructor
public class TurfImageController {

    private final TurfImageService turfImageService;

    // SECURITY FIX: image upload/delete/thumbnail-change were unrestricted;
    // any authenticated user (including a Customer) could modify any turf's
    // images. Restricted to OWNER/ADMIN.
    @PostMapping(value = "/{turfId}", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<String> uploadImages(
            @PathVariable Long turfId,
            @RequestParam("images") List<MultipartFile> images) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(turfImageService.uploadImages(turfId, images));
    }

    // Browsing images stays public, matching the public turf browsing APIs
    @GetMapping("/{turfId}")
    public ResponseEntity<List<TurfImageResponseDto>> getImages(
            @PathVariable Long turfId) {

        return ResponseEntity.ok(
                turfImageService.getImagesByTurf(turfId));
    }

    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<String> deleteImage(
            @PathVariable Long imageId) {

        return ResponseEntity.ok(
                turfImageService.deleteImage(imageId));
    }

    @PatchMapping("/{imageId}/thumbnail")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<String> setThumbnail(
            @PathVariable Long imageId) {

        return ResponseEntity.ok(
                turfImageService.setThumbnail(imageId));
    }
}
