package com.turfbooking.dto.turfimage;

import lombok.Data;

@Data
public class TurfImageResponseDto {

    private Long id;

    private String imageUrl;

    private Integer displayOrder;

    private Boolean thumbnail;
}