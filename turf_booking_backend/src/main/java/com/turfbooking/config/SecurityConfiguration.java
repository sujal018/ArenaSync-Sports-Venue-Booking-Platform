package com.turfbooking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.turfbooking.security.CustomJwtVerificationFilter;

import lombok.RequiredArgsConstructor;

/*
 * @EnableMethodSecurity added below.
 *
 * Previously this class only had .anyRequest().authenticated() — meaning
 * ANY logged-in user (including a plain Customer) could call ANY endpoint,
 * such as GET /api/users (list every user) or /api/admin/dashboard.
 * @PreAuthorize annotations added to the controllers now depend on this
 * being enabled; without it, they are silently ignored.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {
	
	private final CustomJwtVerificationFilter customJWTVerificationFilter;

	@Bean
	SecurityFilterChain customSecurityFilterChain(HttpSecurity http) throws Exception
	{
		http.cors(Customizer.withDefaults());
		http.csrf(csrf -> csrf.disable());
		
		
		http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
		
		http.authorizeHttpRequests(auth -> auth

                // Public APIs
				 .requestMatchers(
			                "/api/auth/login",
			                "/api/users/register",
			                "/swagger-ui/**",
			                "/v3/api-docs/**",
			                "/uploads/**"
			        ).permitAll()
                // Public Turf APIs
				 .requestMatchers(
						    "/api/bookings/*",
						    "/api/bookings/internal/**",
						    "/api/bookings/payment-success/**",
						    "/api/bookings/payment-failed/**"
						).permitAll()
				 .requestMatchers(HttpMethod.GET,
					        "/api/turfs",
					        "/api/turfs/**",
					        "/api/turf-images",
					        "/api/turf-images/**",
					        "/uploads/**"
					).permitAll()
                // Everything else requires authentication
                .anyRequest().authenticated());
		
		http.addFilterBefore(customJWTVerificationFilter, UsernamePasswordAuthenticationFilter.class);
	
		return http.build();
		
	}
	
	@Bean
	PasswordEncoder passwordEncoder()
	{
		return new BCryptPasswordEncoder();
	}
	
	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception
	{
		return config.getAuthenticationManager();
	}


}

