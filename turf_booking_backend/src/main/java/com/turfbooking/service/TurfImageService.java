package com.turfbooking.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.turfbooking.dto.turfimage.TurfImageResponseDto;

public interface TurfImageService {

    String uploadImages(Long turfId, List<MultipartFile> images);

    List<TurfImageResponseDto> getImagesByTurf(Long turfId);

    String deleteImage(Long imageId);

    String setThumbnail(Long imageId);
}