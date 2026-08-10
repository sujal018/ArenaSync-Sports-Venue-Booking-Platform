package com.turfbooking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.turfbooking.entity.TurfImage;

public interface TurfImageRepository extends JpaRepository<TurfImage, Long> {

    List<TurfImage> findByTurfIdOrderByDisplayOrderAsc(Long turfId);

    Optional<TurfImage> findByTurfIdAndThumbnailTrue(Long turfId);

    long countByTurfId(Long turfId);
}