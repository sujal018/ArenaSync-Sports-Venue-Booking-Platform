package com.turfbooking.security;

import java.security.Principal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/*
 * FIX: implements java.security.Principal now.
 * Authentication.getName() (Spring Security) falls back to
 * this.principal.toString() unless the principal implements
 * UserDetails / AuthenticatedPrincipal / Principal. Previously this class
 * implemented none of those, so authentication.getName() returned a
 * useless Object hash string instead of the user's email everywhere it
 * was called (e.g. BookingServiceImpl.createBooking() ->
 * userRepository.findByEmail(authentication.getName())), causing every
 * such lookup to fail with "Customer not found" for a perfectly valid,
 * logged-in user.
 */
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class JwtPrincipal implements Principal {

	private long userId;

	private String email;

	@Override
	public String getName() {
		return email;
	}
}
