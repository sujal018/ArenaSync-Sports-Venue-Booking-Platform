package com.turfbooking.dto.user;



import com.turfbooking.enums.UserRole;

import lombok.Data;

@Data

public class LoginResponseDto {

    private String token;

    private Long userId;
    private String email;

    private String fullName;

    private UserRole role;
}