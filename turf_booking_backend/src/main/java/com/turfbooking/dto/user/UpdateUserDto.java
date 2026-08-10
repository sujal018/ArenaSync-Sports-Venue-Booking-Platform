package com.turfbooking.dto.user;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateUserDto {

    private String firstName;

    private String lastName;

    @Pattern(regexp = "^[6-9]\\d{9}$",
            message = "Invalid mobile number")
    private String phoneNumber;

    private String profileImage;
 
}