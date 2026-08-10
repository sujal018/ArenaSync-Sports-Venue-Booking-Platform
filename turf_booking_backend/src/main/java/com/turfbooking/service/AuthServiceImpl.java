package com.turfbooking.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.turfbooking.dto.user.LoginRequestDto;
import com.turfbooking.dto.user.LoginResponseDto;
import com.turfbooking.security.CustomUserDetailsImpl;
import com.turfbooking.security.JwtUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Override
    public LoginResponseDto login(LoginRequestDto dto) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        dto.getEmail(),
                        dto.getPassword()));

        CustomUserDetailsImpl user =
                (CustomUserDetailsImpl) authentication.getPrincipal();

        String token = jwtUtils.generateJwt(user);

        LoginResponseDto response = new LoginResponseDto();

        response.setToken(token);
        response.setUserId(user.getUser().getId());
        response.setEmail(user.getUser().getEmail());
        response.setFullName(
                user.getUser().getFirstName() + " " +
                user.getUser().getLastName());
        response.setRole(user.getUser().getRole());

        return response;
    }
}