package com.turfbooking.service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.turfbooking.dto.user.UpdateUserDto;
import com.turfbooking.dto.user.UserRequestDto;
import com.turfbooking.dto.user.UserResponseDto;
import com.turfbooking.entity.User;
import com.turfbooking.enums.UserStatus;
import com.turfbooking.exception.ResourceAlreadyExistsException;
import com.turfbooking.exception.ResourceNotFoundException;
import com.turfbooking.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
	private final UserRepository userRepository;

	private final ModelMapper modelMapper;
	private final PasswordEncoder passwordEncoder;

	@Override
	public String registerUser(UserRequestDto requestDto) {

		if (userRepository.existsByEmail(requestDto.getEmail())) {
			throw new ResourceAlreadyExistsException("Email already registered.");
		}

		if (userRepository.existsByPhoneNumber(requestDto.getPhoneNumber())) {
			throw new ResourceAlreadyExistsException("PhoneNumber  already registered.");
		}

		/*
		 * SECURITY FIX: /api/users/register is a PUBLIC endpoint (no auth required).
		 * The original code did modelMapper.map(requestDto, User.class), which copied
		 * requestDto.role directly onto the entity. Since UserRole allows ADMIN, any
		 * anonymous visitor could POST {"role":"ADMIN", ...} and self-register as an
		 * administrator. Public self-registration must never be trusted to assign a
		 * privileged role — only CUSTOMER or OWNER are allowed here. ADMIN accounts
		 * must be created another way (seeded directly in the DB, or via a separate
		 * endpoint restricted to hasRole('ADMIN')).
		 */
		if (requestDto.getRole() == com.turfbooking.enums.UserRole.ADMIN) {
			throw new IllegalArgumentException(
					"Cannot self-register as ADMIN. Admin accounts must be created by an existing admin.");
		}

		User user = modelMapper.map(requestDto, User.class);

		user.setPassword(passwordEncoder.encode(requestDto.getPassword()));

		userRepository.save(user);

		return "User Registered Successfully";
	}

	@Override
	public List<User> allUsers() {

		return userRepository.findAll();
	}

	@Override
	public UserResponseDto userbyEmail(String email) {

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

		return modelMapper.map(user, UserResponseDto.class);
	}

	@Override
	public String updateStatusUser(String email, UserStatus userStatus) {

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

		user.setStatus(userStatus);
		return "User deleted successfully";
	}

	@Override
	public String updateUser(String email, UpdateUserDto updateDto) {

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

		if (updateDto.getFirstName() != null && !updateDto.getFirstName().isBlank()) {
			user.setFirstName(updateDto.getFirstName());
		}

		if (updateDto.getLastName() != null && !updateDto.getLastName().isBlank()) {
			user.setLastName(updateDto.getLastName());
		}

		if (updateDto.getPhoneNumber() != null && !updateDto.getPhoneNumber().isBlank()) {
			user.setPhoneNumber(updateDto.getPhoneNumber());
		}

		if (updateDto.getProfileImage() != null && !updateDto.getProfileImage().isBlank()) {
			user.setProfileImage(updateDto.getProfileImage());
		}

		userRepository.save(user);

		return "User updated successfully";
	}

	@Override
	public List<UserResponseDto> findUserByStatus(UserStatus userStatus) {

		List<User> list = userRepository.findByStatus(userStatus);

		List<UserResponseDto> ls = new ArrayList<>();

		list.forEach(user -> ls.add(modelMapper.map(user, UserResponseDto.class)));

		return ls;
	}
	@Override
	public UserResponseDto uploadProfileImage(String email, MultipartFile image) {

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

	    try {

	        String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();

	        Path uploadPath = Paths.get("uploads/profile");

	        if (!Files.exists(uploadPath)) {
	            Files.createDirectories(uploadPath);
	        }

	        Files.copy(
	                image.getInputStream(),
	                uploadPath.resolve(fileName),
	                StandardCopyOption.REPLACE_EXISTING
	        );

	        user.setProfileImage("/uploads/profile/" + fileName);

	        userRepository.save(user);

	        return modelMapper.map(user, UserResponseDto.class);

	    } catch (IOException e) {
	        throw new RuntimeException("Failed to upload profile image");
	    }
	}
	

}
