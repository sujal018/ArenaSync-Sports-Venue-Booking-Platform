package com.turfbooking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.turfbooking.entity.User;
import java.util.List;

import com.turfbooking.enums.UserRole;
import com.turfbooking.enums.UserStatus;



public interface UserRepository extends JpaRepository<User, Long> {
	boolean existsByEmail(String email);
	boolean existsByPhoneNumber(String phoneNumber);
	Optional<User> findByEmail(String email);
	List<User> findByStatus(UserStatus status);
	long countByRole(UserRole role);
}
