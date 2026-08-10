package com.turfbooking.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtUtils {

	@Value("${jwt.secret.key}")
	private String key;

	@Value("${jwt.expiration.time}")
	private Long expTime;

	private SecretKey secretKey;

	@PostConstruct
	public void init() {
		secretKey = Keys.hmacShaKeyFor(key.getBytes(StandardCharsets.UTF_8));
	}

	public String generateJwt(CustomUserDetailsImpl userDetails) {
		Date iat = new Date();
		Date expiresAt = new Date(iat.getTime() + expTime);
		return Jwts.builder().subject(userDetails.getUsername()).issuedAt(iat).expiration(expiresAt)
				.claims(Map.of("user_id", userDetails.getUser().getId(), "user_role",
						userDetails.getUser().getRole().name(), "user_email", userDetails.getUser().getEmail()))
				.signWith(secretKey).compact();
	}

	public Claims validateTokenAndGetClaims(String jwt) {
		return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(jwt).getPayload();
	}
}
