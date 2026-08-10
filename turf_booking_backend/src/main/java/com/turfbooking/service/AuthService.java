package com.turfbooking.service;

import com.turfbooking.dto.user.LoginRequestDto;
import com.turfbooking.dto.user.LoginResponseDto;

public interface AuthService {
	 LoginResponseDto login(LoginRequestDto dto);
}
