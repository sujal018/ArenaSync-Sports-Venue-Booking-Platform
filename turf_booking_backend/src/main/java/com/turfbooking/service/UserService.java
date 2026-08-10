package com.turfbooking.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.turfbooking.dto.user.UpdateUserDto;
import com.turfbooking.dto.user.UserRequestDto;
import com.turfbooking.dto.user.UserResponseDto;
import com.turfbooking.entity.User;
import com.turfbooking.enums.UserStatus;

import jakarta.validation.Valid;

public interface UserService {

	 String registerUser(UserRequestDto requestDto);

	 List<User> allUsers();

	 UserResponseDto  userbyEmail(String email);

	 String updateStatusUser(String email, UserStatus userStatus);

	 String updateUser(String email,  UpdateUserDto updateUserDto);

	 List<UserResponseDto> findUserByStatus(UserStatus userStatus);

	 UserResponseDto uploadProfileImage(String email, MultipartFile image);


	
}
