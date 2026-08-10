package com.turfbooking.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.turfbooking.dto.turfimage.TurfImageResponseDto;
import com.turfbooking.entity.Turf;
import com.turfbooking.entity.TurfImage;
import com.turfbooking.exception.ResourceNotFoundException;
import com.turfbooking.repository.TurfImageRepository;
import com.turfbooking.repository.TurfRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class TurfImageServiceImpl implements TurfImageService {

    private final TurfRepository turfRepository;
    private final TurfImageRepository turfImageRepository;
    private final ModelMapper modelMapper;

    private static final String UPLOAD_DIR = "uploads/turfs/";

    @Override
    public String uploadImages(Long turfId, List<MultipartFile> images) {

        Turf turf = turfRepository.findById(turfId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Turf not found."));

        long existingImages = turfImageRepository.countByTurfId(turfId);

        if (existingImages + images.size() > 5) {
            throw new IllegalArgumentException("Maximum 5 images are allowed per turf.");
        }

        int displayOrder = (int) existingImages + 1;

        Path uploadPath = Paths.get(UPLOAD_DIR + turfId);

        try {

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            for (MultipartFile file : images) {

                if (file.isEmpty()) {
                    throw new IllegalArgumentException("Image file cannot be empty.");
                }

                String contentType = file.getContentType();

                if (contentType == null ||
                        !(contentType.equalsIgnoreCase("image/jpeg")
                                || contentType.equalsIgnoreCase("image/jpg")
                                || contentType.equalsIgnoreCase("image/png"))) {

                    throw new IllegalArgumentException("Only JPG, JPEG and PNG images are allowed.");
                }

                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

                Files.copy(file.getInputStream(), uploadPath.resolve(fileName));

                TurfImage image = TurfImage.builder()
                        .imageUrl("/uploads/turfs/" + turfId + "/" + fileName)
                        .displayOrder(displayOrder++)
                        .thumbnail(existingImages == 0)
                        .turf(turf)
                        .build();

                turfImageRepository.save(image);

                existingImages++;
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image.", e);
        }

        return "Images uploaded successfully.";
    }

    @Override
    public List<TurfImageResponseDto> getImagesByTurf(Long turfId) {

        turfRepository.findById(turfId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Turf not found."));

        return turfImageRepository
                .findByTurfIdOrderByDisplayOrderAsc(turfId)
                .stream()
                .map(image -> modelMapper.map(image, TurfImageResponseDto.class))
                .toList();
    }

    @Override
    public String deleteImage(Long imageId) {

        TurfImage image = turfImageRepository.findById(imageId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Image not found."));

        Long turfId = image.getTurf().getId();
        boolean wasThumbnail = image.getThumbnail();

        try {

            Path filePath = Paths.get(image.getImageUrl().replaceFirst("/", ""));
            Files.deleteIfExists(filePath);

        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image file.", e);
        }

        turfImageRepository.delete(image);

        if (wasThumbnail) {

            turfImageRepository.findByTurfIdOrderByDisplayOrderAsc(turfId)
                    .stream()
                    .findFirst()
                    .ifPresent(nextImage -> {
                        nextImage.setThumbnail(true);
                        turfImageRepository.save(nextImage);
                    });
        }

        return "Image deleted successfully.";
    }

    @Override
    public String setThumbnail(Long imageId) {

        TurfImage image = turfImageRepository.findById(imageId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Image not found."));

        turfImageRepository
                .findByTurfIdAndThumbnailTrue(image.getTurf().getId())
                .ifPresent(existing -> {
                    existing.setThumbnail(false);
                    turfImageRepository.save(existing);
                });

        image.setThumbnail(true);
        turfImageRepository.save(image);

        return "Thumbnail updated successfully.";
    }
}