package com.turfbooking.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.turfbooking.dto.user.UpdateUserDto;
import com.turfbooking.dto.user.UserRequestDto;
import com.turfbooking.enums.UserStatus;
import com.turfbooking.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

	 private final UserService userService;

	// Public: anyone can register (role forced to non-admin in the service layer)
	@PostMapping("/register")
	public ResponseEntity<?> registerUser(@Valid  @RequestBody UserRequestDto requestDto){
		return ResponseEntity.status(HttpStatus.CREATED).body(userService.registerUser(requestDto));
	}

	// SECURITY FIX: previously had no restriction at all -> any logged in
	// Customer could list every user in the system. Admin only now.
	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> getalluser(){
		return ResponseEntity.ok(userService.allUsers());
	}

	// A user may look up their own profile, or an admin may look up anyone's
	@GetMapping("{email}")
	@PreAuthorize("hasRole('ADMIN') or #email == authentication.name")
	public ResponseEntity<?> findByEmail(@PathVariable String email){
		return ResponseEntity.ok(userService.userbyEmail(email));
	}

	// SECURITY FIX: previously any authenticated user could activate/deactivate
	// any other account (including admins). Admin only now.
	@PatchMapping("/{email}/status/{status}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> updateUserStatus(
	        @PathVariable String email,
	        @PathVariable UserStatus status) {

	    return ResponseEntity.ok(userService.updateStatusUser(email, status));
	}


	  @PutMapping("/{email}")
	  @PreAuthorize("hasRole('ADMIN') or #email == authentication.name")
	   public ResponseEntity<?> updateUser(@PathVariable String email,@Valid @RequestBody UpdateUserDto updateUserDto) {


	        return ResponseEntity.ok(userService.updateUser(email,updateUserDto));
	    }

	  // SECURITY FIX: previously unrestricted; filtering users by status
	  // (e.g. all ACTIVE/INACTIVE accounts) is admin-only functionality.
	  @GetMapping("/status/{status}")
	  @PreAuthorize("hasRole('ADMIN')")
	  public ResponseEntity<?> findbyStatus(@PathVariable UserStatus status) {

	        return ResponseEntity.ok(userService.findUserByStatus(status));
	    }

	  @PatchMapping(value = "/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	    @PreAuthorize("hasRole('CUSTOMER') or hasRole('OWNER') or hasRole('ADMIN')")
	    public ResponseEntity<?> uploadProfileImage(
	            @RequestParam("image") MultipartFile image,
	            Authentication authentication) {

	        String email = authentication.getName();
	        return ResponseEntity.ok(userService.uploadProfileImage(email, image));
	    }
//	  @PutMapping("/{email}/change-password")
//	  public ResponseEntity<?> changePassword(
//	          @PathVariable String email,
//	          @RequestBody ChangePasswordDto dto){
//
//	      return ResponseEntity.ok(
//	              userService.changePassword(email, dto));
////	  }


}
