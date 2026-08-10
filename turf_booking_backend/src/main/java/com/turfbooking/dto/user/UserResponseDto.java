package com.turfbooking.dto.user;

import java.time.LocalDateTime;

import com.turfbooking.enums.UserRole;
import com.turfbooking.enums.UserStatus;

import lombok.Data;

@Data
public class UserResponseDto {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private String profileImage;

    private UserRole role;

    private UserStatus status;


}